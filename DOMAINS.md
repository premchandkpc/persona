# Persona - Domain Model

## Core Domains

### 1. User Domain
**Responsibility**: User management, authentication, profiles, interests

**Entities**:
- User
- UserProfile
- UserInterests
- UserPreferences
- UserConnections (followers, following)

**Key Services**:
- User Service (Python)

**Features**:
- Registration & login
- Profile management
- Interest tracking (videos, audios, simulations, letters, posts)
- Social connections

---

### 2. Content Domain
**Responsibility**: Content creation, management, and discovery

**Entities**:
- Post
- Letter
- InstagramContent
- Tag
- Category

**Key Services**:
- Content Service (Go)

**Features**:
- Create/edit/delete posts
- Write letters
- Integrate Instagram content
- Search & filter
- Content discovery

---

### 3. Media Domain
**Responsibility**: Video, audio, and file management

**Entities**:
- Video
- Audio
- Media (base)
- MediaMetadata
- MediaStream

**Key Services**:
- Media Service (Node.js)

**Features**:
- Upload videos & audios
- Processing (transcoding, compression)
- Streaming delivery
- Thumbnail generation
- Quality variants

---

### 4. Analytics Domain
**Responsibility**: Tracking user behavior and insights

**Entities**:
- Event
- UserBehavior
- Analytics
- Report

**Key Services**:
- Analytics Service (Java)

**Features**:
- Event tracking
- User behavior analysis
- Report generation
- Dashboards
- Performance metrics

---

### 5. Simulation Domain
**Responsibility**: Complex simulations and computations

**Entities**:
- Simulation
- SimulationInput
- SimulationOutput
- SimulationResult

**Key Services**:
- Simulation Service (Rust)

**Features**:
- Run simulations
- Real-time calculations
- Result caching
- High-performance computing

---

## Entity Relationships

```
User (1) ──────── (Many) UserInterests
  │
  ├──── (Many) Post
  ├──── (Many) Letter
  ├──── (Many) Connections
  └──── (Many) UserProfile

Post (1) ──────── (Many) Comments
Letter (1) ──────── (Many) Interactions

Media (1) ──────── (Many) Streams
Media (1) ──────── (1) MediaMetadata

Event (Many) ──────── (1) User
Analytics (Many) ──────── (1) User

Simulation (1) ──────── (Many) Results
```

---

## User Interest Categories

### 1. Videos
- Watching history
- Preferences (duration, genre)
- Recommendations

### 2. Audios
- Listening history
- Preferences (genre, artist)
- Playlists

### 3. Simulations
- Simulation history
- Results saved
- Performance tracking

### 4. Letters
- Writing history
- Reading history
- Saved letters

### 5. Posts
- Posting activity
- Engagement
- Social interactions

### 6. Instagram Content
- Linked accounts
- Saved posts
- Engagement tracking

---

## Data Flow Across Services

```
User Service ──→ Content Service (publish posts)
     ↓              ↓
     └──→ Analytics Service (track events)
            ↓
User Service ←── Media Service (upload media)
     ↓
Content Service ←── Media Service (attach media to posts)
     ↓
Simulation Service (run on user content)
     ↓
Analytics Service (track results)
```

---

## API Contract Overview

### User Service APIs
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user
- `POST /users/{id}/interests` - Add interests

### Content Service APIs
- `POST /posts` - Create post
- `GET /posts` - Get posts feed
- `GET /posts/{id}` - Get post details
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `POST /letters` - Create letter
- `GET /letters` - Get letters

### Media Service APIs
- `POST /media/upload` - Upload video/audio
- `GET /media/{id}` - Get media
- `GET /media/{id}/stream` - Stream media
- `DELETE /media/{id}` - Delete media

### Analytics Service APIs
- `POST /events` - Track event
- `GET /analytics/user/{id}` - Get user analytics
- `GET /reports` - Generate reports

### Simulation Service APIs
- `POST /simulations` - Create simulation
- `GET /simulations/{id}` - Get simulation
- `GET /simulations/{id}/results` - Get results
- `POST /simulations/{id}/run` - Run simulation

---

## Implementation Order

1. **Foundation** (Week 1-2)
   - Set up infrastructure (Docker, K8s)
   - Define API contracts
   - Set up databases

2. **User Service** (Week 2-3)
   - Basic user management
   - Authentication
   - Profile management

3. **Content Service** (Week 3-4)
   - Post management
   - Letter system
   - Search

4. **Media Service** (Week 4-5)
   - Upload handling
   - Basic streaming

5. **Analytics Service** (Week 5-6)
   - Event tracking
   - Basic reporting

6. **Simulation Service** (Week 6-7)
   - Core simulation engine

7. **Integration** (Week 7-8)
   - Service communication
   - E2E testing

---

**This ensures each domain is well-structured and scalable from the start.**
