# Media Service - Node.js

Video and audio handling service built with Node.js.

## Features
- Video upload & processing
- Audio upload & processing
- Streaming & delivery
- Thumbnail generation
- Quality variants (HQ, SD, mobile)

## Tech Stack
- **Framework**: Express/Nest.js
- **Database**: PostgreSQL
- **Storage**: S3/GCS
- **Processing**: FFmpeg
- **Language**: Node.js

## API Endpoints
- `POST /media/upload` - Upload video/audio
- `GET /media/{id}` - Get media
- `GET /media/{id}/stream` - Stream media
- `DELETE /media/{id}` - Delete media
- `GET /media/{id}/info` - Get media metadata

## Setup
```bash
npm init -y
npm install express cors dotenv multer
```

## Run
```bash
npm start
```

## Port
8003
