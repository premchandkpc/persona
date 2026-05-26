# Media Service (Node.js) - Complete Guide

**Project**: Video and Audio Upload, Processing, and Streaming
**Language**: Node.js + Express/NestJS
**Difficulty**: Intermediate-Advanced
**Time**: 3-4 hours
**Location**: `/persona/backend/services/media-service-nodejs/`
**Port**: 8003

---

## Table of Contents
1. [What Does It Do?](#what-does-it-do)
2. [Why Node.js?](#why-nodejs)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Processing Pipeline](#processing-pipeline)
6. [API Endpoints](#api-endpoints)
7. [How to Run](#how-to-run)
8. [Examples](#examples)

---

## What Does It Do?

**TL;DR**: Handles video/audio uploads, processes them (transcode, compress), and serves them via CDN.

### Responsibilities
- File upload (multipart/form-data)
- Validation (size, format, duration)
- Storage (S3/Google Cloud Storage)
- Processing (FFmpeg: transcode, compress, extract metadata)
- Thumbnail generation
- Quality variants (HQ, SD, mobile-optimized)
- Streaming URLs
- CDN integration
- Delete operations
- Metadata tracking

### Why Separate?
```
Media operations are I/O-heavy (waiting for file upload, FFmpeg processing)
Node.js excels at I/O-heavy workloads with async/await

If media lived in another service → blocks that service while uploading
With separate service → User/Content services unaffected by uploads
```

---

## Why Node.js?

### Characteristics
**1. Non-blocking I/O**
```javascript
// Waits for file upload WITHOUT blocking other requests
await file.upload();  // Async
await ffmpeg.transcode();  // Async
// Other requests handled while waiting ✓
```

**2. Streaming Capability**
```javascript
// Serve video without loading entire file into memory
response.pipe(fs.createReadStream('video.mp4'));
// Streams chunks: [0-100KB], [100-200KB], ...
// Memory usage: constant, not file_size
```

**3. Perfect for Message Queues**
```javascript
// Process uploads asynchronously
// Queue job → return immediately → process in background
import Bull from 'bull';

const uploadQueue = new Bull('uploads');
uploadQueue.process(async (job) => {
    await ffmpeg.transcode(job.data.file);  // Can take minutes
});

router.post('/upload', async (req, res) => {
    const jobId = await uploadQueue.add(req.file);
    res.json({ jobId });  // Return immediately
});
```

---

## Tech Stack

### Express.js or NestJS
```javascript
// Express: Lightweight, minimal
const express = require('express');
const app = express();

app.post('/upload', handleUpload);
app.get('/media/:id/stream', streamMedia);
app.delete('/media/:id', deleteMedia);

app.listen(3000);
```

```typescript
// NestJS: Full-featured framework (recommend for large project)
@Controller('media')
export class MediaController {
  @Post('upload')
  uploadFile(@UploadedFile() file) { }
  
  @Get(':id/stream')
  streamMedia(@Param('id') id) { }
}
```

### FFmpeg (Media Processing)
```bash
# Command-line tool for video/audio manipulation
ffmpeg -i input.mp4 \
  -vf "scale=1280:720" \           # Resize
  -c:v libx264 -crf 23 \           # H.264 codec, quality
  -c:a aac -b:a 128k \             # AAC audio, 128kbps
  output.mp4

# Node wrapper: fluent-ffmpeg
const ffmpeg = require('fluent-ffmpeg');

ffmpeg('input.mp4')
  .size('1280x720')
  .audioCodec('aac')
  .audioChannels(2)
  .audioFrequency(44100)
  .format('mp4')
  .save('output.mp4');
```

### S3 (Object Storage)
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Upload file
await s3.upload({
    Bucket: 'persona-media',
    Key: 'videos/123/original.mp4',
    Body: fileBuffer,
    ContentType: 'video/mp4'
}).promise();

// Generate signed URL (time-limited access)
const url = s3.getSignedUrl('getObject', {
    Bucket: 'persona-media',
    Key: 'videos/123/original.mp4',
    Expires: 3600  // 1 hour
});

// Stream from S3
s3.getObject({...}).createReadStream().pipe(response);
```

### Bull Queue (Job Processing)
```javascript
// Redis-backed job queue
const uploadQueue = new Bull('uploads', {
    redis: 'redis://localhost:6379'
});

// Producer: Add job
uploadQueue.add({
    fileId: 'file_123',
    originalFile: 's3://bucket/file.mov'
}, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true
});

// Consumer: Process job
uploadQueue.process(async (job) => {
    const { fileId, originalFile } = job.data;
    
    // Download from S3
    const buffer = await s3.getObject({Key: originalFile}).promise();
    
    // Transcode to multiple qualities
    const qualities = ['hq', 'sd', 'mobile'];
    for (const quality of qualities) {
        await transcode(buffer, quality);  // Takes time
    }
    
    // Mark as complete
    return { success: true, qualities };
});

// Monitor queue
uploadQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

uploadQueue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed: ${err.message}`);
});
```

---

## Architecture

### Folder Structure
```
media-service-nodejs/
├── src/
│   ├── main.ts              # Entry point
│   ├── config/
│   │   └── config.ts        # Environment variables
│   │
│   ├── controllers/
│   │   ├── upload.ts        # POST /upload
│   │   ├── stream.ts        # GET /media/:id/stream
│   │   └── metadata.ts      # GET /media/:id/info
│   │
│   ├── services/
│   │   ├── upload.service.ts  # Validate, store file
│   │   ├── process.service.ts # FFmpeg operations
│   │   ├── stream.service.ts  # Generate streaming URLs
│   │   └── metadata.service.ts # Extract info
│   │
│   ├── processors/
│   │   ├── transcode.processor.ts  # Background job
│   │   ├── thumbnail.processor.ts  # Thumbnail generation
│   │   └── cleanup.processor.ts    # Delete old files
│   │
│   ├── repositories/
│   │   ├── media.repository.ts  # Database queries
│   │   └── quality.repository.ts # Track qualities
│   │
│   ├── queues/
│   │   ├── upload.queue.ts   # Bull configuration
│   │   └── events.ts         # Event publishing
│   │
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── upload.ts         # multipart/form-data
│   │   └── errors.ts         # Error handling
│   │
│   └── types/
│       └── index.ts          # TypeScript interfaces
│
├── package.json
├── Dockerfile
└── tsconfig.json
```

### Request Flow - Upload
```
User uploads video.mp4 (100MB)
    ↓
[Auth Middleware] verifies JWT
    ↓
[Upload Middleware] receives multipart data
    ↓
[Upload Controller]
├─→ Validate: size, format, duration
├─→ Generate unique ID
├─→ Save to temporary storage
├─→ Add job to Bull queue
└─→ Return immediately with jobId
    ↓
Return 202 Accepted (processing started)
    ↓
[Bull Queue] picks up job
    ├─→ Download from temp storage
    ├─→ Extract metadata (duration, resolution, bitrate)
    ├─→ Transcode to HQ (1080p, H.264, 5Mbps)
    ├─→ Transcode to SD (720p, H.264, 2Mbps)
    ├─→ Transcode to Mobile (480p, H.264, 1Mbps)
    ├─→ Extract thumbnail at 5 seconds
    ├─→ Upload all to S3
    ├─→ Update database with URLs
    └─→ Publish "media.ready" event
    ↓
Client polls /media/{jobId}/status → "ready"
    ↓
Client can now stream from CDN ✓
```

---

## Processing Pipeline

### Step 1: Validate Upload
```typescript
async validateMedia(file: Express.Multer.File): Promise<ValidationResult> {
    // Check file size (max 5GB)
    if (file.size > 5 * 1024 * 1024 * 1024) {
        throw new Error('File too large');
    }
    
    // Check MIME type
    const validTypes = ['video/mp4', 'video/quicktime', 'audio/mpeg'];
    if (!validTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type');
    }
    
    // Check duration using FFprobe
    const metadata = await this.ffmpeg.getMetadata(file.path);
    if (metadata.duration > 3600) {  // 1 hour max
        throw new Error('Video too long');
    }
    
    return { valid: true, metadata };
}
```

### Step 2: Store Original
```typescript
async storeOriginal(file: Express.Multer.File): Promise<string> {
    const fileId = generateUUID();
    const s3Key = `originals/${fileId}/${file.originalname}`;
    
    const result = await s3.upload({
        Bucket: 'persona-media',
        Key: s3Key,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
        Metadata: {
            originalName: file.originalname,
            uploadedBy: userId
        }
    }).promise();
    
    // Delete temp file
    fs.unlinkSync(file.path);
    
    return fileId;
}
```

### Step 3: Transcode to Qualities
```typescript
async transcodeMedia(fileId: string): Promise<{hq: string; sd: string; mobile: string}> {
    const original = await s3.getObject({
        Bucket: 'persona-media',
        Key: `originals/${fileId}/original.mp4`
    }).promise();
    
    const results = {};
    
    // HQ: 1080p, H.264, 5Mbps
    results.hq = await this.transcode(original.Body, {
        resolution: '1920x1080',
        bitrate: '5000k',
        output: `hq/${fileId}.mp4`
    });
    
    // SD: 720p, H.264, 2.5Mbps
    results.sd = await this.transcode(original.Body, {
        resolution: '1280x720',
        bitrate: '2500k',
        output: `sd/${fileId}.mp4`
    });
    
    // Mobile: 480p, H.264, 1Mbps
    results.mobile = await this.transcode(original.Body, {
        resolution: '854x480',
        bitrate: '1000k',
        output: `mobile/${fileId}.mp4`
    });
    
    return results;
}

private transcode(input: Buffer, options: TranscodeOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .size(options.resolution)
            .videoBitrate(options.bitrate)
            .audioCodec('aac')
            .audioFrequency(44100)
            .audioChannels(2)
            .format('mp4')
            .on('end', () => {
                // Upload to S3
                const s3Key = `processed/${options.output}`;
                resolve(s3Key);
            })
            .on('error', reject)
            .save('-');
    });
}
```

### Step 4: Generate Thumbnail
```typescript
async generateThumbnail(fileId: string): Promise<string> {
    const original = await s3.getObject({
        Bucket: 'persona-media',
        Key: `originals/${fileId}/original.mp4`
    }).promise();
    
    return new Promise((resolve, reject) => {
        ffmpeg(original.Body)
            .seek('5%')  // 5 seconds in
            .screenshots({
                timestamps: ['5%'],
                filename: 'thumbnail.jpg',
                size: '320x180'
            })
            .on('end', async () => {
                // Upload thumbnail to S3
                const s3Key = `thumbnails/${fileId}.jpg`;
                await s3.upload({
                    Bucket: 'persona-media',
                    Key: s3Key,
                    Body: fs.readFileSync('thumbnail.jpg')
                }).promise();
                resolve(s3Key);
            })
            .on('error', reject);
    });
}
```

### Step 5: Streaming URLs
```typescript
async getStreamingURLs(fileId: string, quality: 'hq' | 'sd' | 'mobile' = 'sd'): Promise<{hls: string; dash: string}> {
    // HLS (HTTP Live Streaming): Apple devices
    const hlsUrl = s3.getSignedUrl('getObject', {
        Bucket: 'persona-media',
        Key: `processed/hls/${fileId}/${quality}.m3u8`,
        Expires: 3600
    });
    
    // DASH (Dynamic Adaptive Streaming): General
    const dashUrl = s3.getSignedUrl('getObject', {
        Bucket: 'persona-media',
        Key: `processed/dash/${fileId}/${quality}.mpd`,
        Expires: 3600
    });
    
    // Or CDN URLs (CloudFront, Cloudflare)
    return {
        hls: `https://cdn.persona.io/${fileId}/${quality}.m3u8`,
        dash: `https://cdn.persona.io/${fileId}/${quality}.mpd`
    };
}
```

---

## API Endpoints

### Upload
```
POST /media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  file: <binary video file>

Response: 202 Accepted
{
  "jobId": "job_abc123",
  "mediaId": "media_123",
  "status": "processing",
  "statusUrl": "/media/job_abc123/status"
}
```

### Check Upload Status
```
GET /media/job/{jobId}/status
Authorization: Bearer {token}

Response:
{
  "jobId": "job_abc123",
  "status": "completed",  // queued, processing, completed, failed
  "progress": 85,  // 0-100%
  "mediaId": "media_123",
  "qualities": ["hq", "sd", "mobile"],
  "thumbnail": "https://cdn.persona.io/thumb_123.jpg",
  "duration": 125,  // seconds
  "resolution": "1920x1080"
}
```

### Stream Media
```
GET /media/{mediaId}/stream?quality=sd
Authorization: Bearer {token}

Response: 200 OK
Content-Type: video/mp4
Content-Length: 50000000
(binary video stream)

OR redirect to CDN:
HTTP/1.1 302 Found
Location: https://cdn.persona.io/media_123/sd.mp4
```

### Get Media Info
```
GET /media/{mediaId}/info
Authorization: Bearer {token}

Response:
{
  "id": "media_123",
  "uploader_id": 1,
  "filename": "nature.mp4",
  "duration": 125,
  "resolution": "1920x1080",
  "bitrate": "5000k",
  "filesize": 98765432,
  "mimeType": "video/mp4",
  "created_at": "2026-01-20T10:00:00Z",
  "qualities": {
    "hq": { "size": 98765432, "url": "https://cdn.persona.io/media_123/hq.mp4" },
    "sd": { "size": 45000000, "url": "https://cdn.persona.io/media_123/sd.mp4" },
    "mobile": { "size": 18000000, "url": "https://cdn.persona.io/media_123/mobile.mp4" }
  },
  "thumbnail": "https://cdn.persona.io/thumb_123.jpg"
}
```

### Delete Media
```
DELETE /media/{mediaId}
Authorization: Bearer {token}

Response:
{
  "id": "media_123",
  "status": "deleted"
}
```

---

## How to Run

### Prerequisites
```bash
# Node.js 18+
node --version

# FFmpeg (for video processing)
brew install ffmpeg  # macOS
apt-get install ffmpeg  # Ubuntu

# PostgreSQL
psql --version

# Redis
redis-cli ping

# AWS S3 access (or Google Cloud Storage)
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

### Setup
```bash
cd /persona/backend/services/media-service-nodejs

# Install dependencies
npm install

# Create .env
cat > .env << EOF
DATABASE_URL=postgresql://user:pass@localhost/persona_media
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret

# S3 Configuration
AWS_REGION=us-east-1
AWS_BUCKET=persona-media

# FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Service ports
PORT=8003
EOF

# Create database
createdb persona_media

# Run migrations
npm run db:migrate

# Build (TypeScript → JavaScript)
npm run build
```

### Run Service
```bash
# Development
npm run dev
# Auto-restarts on file changes

# Production
npm start
# Runs pre-compiled JavaScript

# With PM2 (process manager)
npm install -g pm2
pm2 start dist/main.js -i 4  # 4 instances for clustering
```

### Run Tests
```bash
npm test

# With coverage
npm run test:coverage

# Integration tests (with real database)
npm run test:integration
```

---

## Examples

### Example 1: Upload Video

**Request**:
```bash
curl -X POST http://localhost:8003/media/upload \
  -H "Authorization: Bearer eyJhbGci..." \
  -F "file=@nature.mp4"
```

**Response**:
```json
{
  "jobId": "job_xyz789",
  "mediaId": "media_123",
  "status": "processing"
}
```

**Behind the scenes**:
```typescript
// 1. Validate
const validation = await uploadService.validateMedia(file);
// Checks: size, format, duration

// 2. Store original
const mediaId = await uploadService.storeOriginal(file);
// Saves to S3: s3://persona-media/originals/media_123/nature.mp4

// 3. Add processing job
const job = await uploadQueue.add({
    mediaId,
    fileId: file.path,
    uploadedBy: userId
}, {
    attempts: 3,
    backoff: {type: 'exponential', delay: 2000}
});

// 4. Return immediately (202 Accepted)
return { jobId: job.id, mediaId, status: 'processing' };
```

### Example 2: Check Upload Status

**Request**:
```bash
curl "http://localhost:8003/media/job/job_xyz789/status" \
  -H "Authorization: Bearer eyJhbGci..."
```

**Response** (while processing):
```json
{
  "jobId": "job_xyz789",
  "status": "processing",
  "progress": 45,
  "currentStep": "transcoding to SD"
}
```

**Response** (after complete):
```json
{
  "jobId": "job_xyz789",
  "status": "completed",
  "progress": 100,
  "mediaId": "media_123",
  "qualities": ["hq", "sd", "mobile"],
  "thumbnail": "https://cdn.persona.io/thumb_123.jpg"
}
```

### Example 3: Stream Video

**Request**:
```bash
curl "http://localhost:8003/media/media_123/stream?quality=sd" \
  -H "Authorization: Bearer eyJhbGci..." \
  -o downloaded.mp4
```

**Behind the scenes**:
```typescript
// 1. Verify user is authorized
const userId = extractUserFromToken(req);

// 2. Check user owns media or it's public
const media = await mediaRepo.getMedia(mediaId);
if (media.uploadedBy !== userId && media.visibility !== 'public') {
    throw new UnauthorizedError();
}

// 3. Generate signed S3 URL
const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: 'persona-media',
    Key: `processed/sd/media_123.mp4`,
    Expires: 3600
});

// 4. Redirect or stream directly
res.redirect(signedUrl);  // Client downloads from S3/CDN
// OR
res.pipe(s3.getObject({...}).createReadStream());  // Stream through service
```

---

## Key Concepts

### Async/Await
```javascript
// Handle long-running operations without blocking
async function uploadAndProcess(file) {
    await validateFile(file);       // Wait for validation
    await storeFile(file);          // Wait for storage
    const job = await addToQueue(); // Wait for job creation
    return job;                      // Return immediately
    // No need to wait for transcoding!
}

// While this executes:
// 1. User gets jobId quickly
// 2. Other users' requests handled
// 3. Bull queue processes transcode in background
```

### Streaming
```javascript
// Handle large files without loading all into memory
const stream = s3.getObject({Key: 'video.mp4'}).createReadStream();
response.pipe(stream);

// Memory usage:
// ❌ Bad: buffer = fs.readFileSync('video.mp4'); response.send(buffer)
//         Loads 1GB file into memory!
// ✓ Good: fs.createReadStream('video.mp4').pipe(response)
//         Streams 64KB chunks, constant memory
```

### Bull Queue
```javascript
// Reliably process async jobs
const queue = new Bull('uploads', { redis });

// If service crashes, job replays from Redis
// If job fails, retry with exponential backoff
queue.add({file: 'vid.mp4'}, {
    attempts: 3,
    backoff: {type: 'exponential', delay: 2000}
});

// Results in:
// Attempt 1: immediate
// Attempt 2: after 2000ms
// Attempt 3: after 4000ms
// Failed: after 8000ms → give up
```

---

## Next Steps
1. Run service: `npm run dev`
2. Try endpoints with Postman
3. Understand: async/await, streams, Bull queue
4. Add new quality variant (4K)
5. Deploy with Docker → Kubernetes
