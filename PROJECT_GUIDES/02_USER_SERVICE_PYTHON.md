# User Service (Python) - Complete Guide

**Project**: Authentication & User Management Microservice
**Language**: Python + FastAPI
**Difficulty**: Beginner-Intermediate
**Time**: 2-3 hours to understand & run
**Location**: `/persona/backend/services/user-service-python/`
**Port**: 8001

---

## Table of Contents
1. [What Does It Do?](#what-does-it-do)
2. [Why Separate Service?](#why-separate-service)
3. [Tech Stack Explained](#tech-stack-explained)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [How to Run](#how-to-run)
8. [Step-by-Step Examples](#step-by-step-examples)

---

## What Does It Do?

**TL;DR**: Handles everything user-related: sign up, login, profiles, interests, connections.

### Responsibilities
- User registration & validation
- Authentication (JWT tokens)
- User profiles (name, bio, settings)
- Interest tracking (what videos/audios/posts user likes)
- User relationships (follow/unfollow)
- Session management

### What It Does NOT Do
- Store videos/audios (Media Service)
- Store posts/letters (Content Service)
- Track analytics events (Analytics Service)
- Run simulations (Simulation Service)

### Data Flow Example
```
User tries to login
    ↓
User Service validates credentials
    ↓
Returns JWT token
    ↓
Token passed to other services
    ↓
Other services verify with User Service
```

---

## Why Separate Service?

### Single Responsibility Principle
```
❌ MONOLITH (bad):
[User + Content + Media + Analytics + Simulation]
 - Hard to scale
 - Hard to change
 - Language mismatch (Python, Go, Node, Java, Rust)

✓ MICROSERVICES (good):
[User Svc] [Content Svc] [Media Svc] [Analytics Svc] [Sim Svc]
 - Scale independently
 - Develop independently
 - Best language per service
```

### User Service Specific Benefits
- Scales separately from content (users ≠ content volume)
- Multiple services depend on it (shared auth)
- Can be reused across platforms (web, mobile, API)
- Can be replaced without affecting others

---

## Tech Stack Explained

### FastAPI
**Why?**
- Async/await (handle concurrent requests)
- Automatic API documentation (Swagger UI)
- Type hints → automatic validation
- Performance comparable to Node/Go

```python
@app.post("/users/register")
async def register(user: UserRegisterSchema):
    # Automatic validation of user object
    # Automatic API docs generation
    # Async request handling
    pass
```

### PostgreSQL
**Why?**
- Relational data (users, follows, interests)
- ACID transactions (data consistency)
- JSON support (flexible schemas)

```
users
├─ id (primary key)
├─ email (unique)
├─ password_hash
├─ created_at
└─ profile (JSON)

user_interests
├─ user_id (foreign key)
├─ interest_type (video, audio, post, etc)
└─ metadata (JSON)

user_follows
├─ follower_id (foreign key)
└─ following_id (foreign key)
```

### Redis
**Why?**
- Fast cache (avoid database hits)
- Session storage (JWT blacklist)
- Rate limiting

```
cache:user:123         → user data
session:token_abc123   → token validity
rate_limit:ip:192.168.1.1:posts → count requests
```

### JWT (JSON Web Tokens)
**How it works**:
```
User logs in
    ↓
Server creates token: header.payload.signature
    ↓
Token sent to client
    ↓
Client sends token in requests
    ↓
Server verifies signature
```

**Token structure**:
```
header: {alg: "HS256", typ: "JWT"}
payload: {user_id: 123, exp: 1234567890, iat: 1234567800}
signature: HMACSHA256(header + payload, secret_key)
```

**Why JWT?**
- Stateless (no server session storage)
- Scalable (multiple servers verify independently)
- Cross-origin friendly (tokens in Authorization header)

---

## Architecture

### Folder Structure
```
user-service-python/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration (DB, Redis, etc)
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py      # login/register
│   │   │   ├── users.py     # profile CRUD
│   │   │   ├── interests.py # interest tracking
│   │   │   └── follows.py   # follow/unfollow
│   │   └── schemas.py       # request/response models
│   │
│   ├── models/
│   │   ├── user.py          # User database model
│   │   ├── interest.py      # Interest model
│   │   └── follow.py        # Follow relationship
│   │
│   ├── services/
│   │   ├── auth_service.py  # Authentication logic
│   │   ├── user_service.py  # User business logic
│   │   └── interest_service.py
│   │
│   ├── repositories/
│   │   ├── user_repo.py     # Database queries
│   │   └── interest_repo.py
│   │
│   ├── middleware/
│   │   ├── auth_middleware.py   # Verify JWT
│   │   └── error_handler.py     # Error handling
│   │
│   └── database.py          # Database connection
│
├── tests/
│   ├── test_auth.py
│   ├── test_users.py
│   └── test_interests.py
│
├── requirements.txt         # Dependencies
├── Dockerfile              # Container config
└── main.py                 # Entry point
```

### Request Flow Diagram
```
HTTP Request
    ↓
[API Gateway] (routes, rate limiting)
    ↓
[Middleware] (verify JWT token)
    ↓
[Route Handler] (receives request)
    ↓
[Service Layer] (business logic)
    ↓
[Repository Layer] (database queries)
    ↓
[Database] (PostgreSQL)
    ↓
Response (JSON)
```

---

## API Endpoints

### Authentication
```
POST /auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}

Response:
{
  "user_id": 123,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600  // seconds
}
```

### User Profile
```
GET /users/{user_id}
Headers: Authorization: Bearer {token}

Response:
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "Engineer",
  "avatar_url": "https://...",
  "created_at": "2026-01-15T10:30:00Z",
  "followers_count": 42,
  "following_count": 100
}
```

```
PUT /users/{user_id}
{
  "name": "Jane Doe",
  "bio": "New bio",
  "settings": {
    "notifications": true,
    "theme": "dark"
  }
}

Response: Updated user object
```

### Interests
```
POST /users/{user_id}/interests
{
  "type": "video",
  "entity_id": "vid_123",
  "action": "like"  // like, watch, save
}

Response:
{
  "interest_id": 456,
  "user_id": 123,
  "type": "video",
  "entity_id": "vid_123",
  "action": "like"
}
```

```
GET /users/{user_id}/interests?type=video&limit=10

Response:
{
  "interests": [
    {
      "interest_id": 456,
      "type": "video",
      "entity_id": "vid_123",
      "action": "like",
      "created_at": "2026-01-20T15:45:00Z"
    },
    ...
  ],
  "total": 342
}
```

### Relationships
```
POST /users/{user_id}/follow
{
  "target_user_id": 789
}

Response:
{
  "follower_id": 123,
  "following_id": 789,
  "created_at": "2026-01-20T16:00:00Z"
}
```

```
DELETE /users/{user_id}/follow/{target_user_id}

Response: { "status": "unfollowed" }
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

Indexes:
  - email (for login lookup)
  - id (primary key)
```

### User Interests Table
```sql
CREATE TABLE user_interests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),  -- 'video', 'audio', 'post', etc
  entity_id VARCHAR(255),  -- ID of the content
  action VARCHAR(50),  -- 'like', 'watch', 'save', etc
  metadata JSONB,  -- Additional info (duration watched, etc)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Indexes:
  - user_id (frequent lookups)
  - (user_id, type) (composite for filtering)
  - created_at (for sorting/pagination)
```

### User Follows Table
```sql
CREATE TABLE user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)  -- Can't follow twice
);

Indexes:
  - follower_id (get my following)
  - following_id (get my followers)
```

---

## How to Run

### Prerequisites
```bash
# Python 3.8+
python --version

# PostgreSQL running
psql --version

# Redis running
redis-cli ping
```

### Setup (First Time)
```bash
# Navigate to service
cd /Users/ramyachowdary/Documents/prem-work/persona/backend/services/user-service-python

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/persona_users
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your_super_secret_key_change_this_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
EOF

# Create database
createdb persona_users

# Run migrations (create tables)
alembic upgrade head
```

### Run Service
```bash
# Option 1: Direct
fastapi run src/main.py
# Service runs on http://localhost:8001

# Option 2: With auto-reload (development)
fastapi dev src/main.py

# Option 3: With Uvicorn (production-like)
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### View API Documentation
```
Visit: http://localhost:8001/docs
(Swagger UI with all endpoints documented)
```

### Run Tests
```bash
pytest tests/ -v

# With coverage
pytest tests/ --cov=src --cov-report=html
# Opens htmlcov/index.html in browser
```

---

## Step-by-Step Examples

### Example 1: Register New User

**Request**:
```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123",
    "name": "Alice Johnson"
  }'
```

**What happens inside**:
```python
# 1. Validate input
# - Email format valid?
# - Password strong enough?
# - Email not already used?

# 2. Hash password (bcrypt)
password_hash = bcrypt.hashpw(b"secure123", bcrypt.gensalt())

# 3. Create user in database
user = User(
  email="alice@example.com",
  password_hash=password_hash,
  name="Alice Johnson"
)
db.session.add(user)
db.session.commit()

# 4. Create JWT token
token = jwt.encode({
  "user_id": 1,
  "exp": datetime.utcnow() + timedelta(hours=24),
  "iat": datetime.utcnow()
}, secret_key="secret", algorithm="HS256")

# 5. Return response
return {
  "user_id": 1,
  "email": "alice@example.com",
  "token": token
}
```

**Response**:
```json
{
  "user_id": 1,
  "email": "alice@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjogMSwgImV4cCI6IDE2NzU0MDMyMDB9.signature"
}
```

### Example 2: Login

**Request**:
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123"
  }'
```

**Inside the service**:
```python
# 1. Find user by email
user = User.query.filter_by(email="alice@example.com").first()

# 2. Verify password (bcrypt)
if not bcrypt.checkpw(b"secure123", user.password_hash):
    raise UnauthorizedError("Invalid credentials")

# 3. Create new JWT token
token = jwt.encode(...)

# 4. Store token in Redis for session tracking (optional)
redis.set(f"session:{token}", user.id, ex=86400)  # 24 hours

# 5. Return token
return { "token": token, "expires_in": 86400 }
```

### Example 3: Get User Profile

**Request** (authenticated):
```bash
curl http://localhost:8001/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Inside the service**:
```python
# 1. Middleware verifies JWT token
token = request.headers.get("Authorization").split(" ")[1]
payload = jwt.decode(token, secret_key, algorithms=["HS256"])
user_id = payload["user_id"]

# 2. Fetch user from database (or cache)
user = cache.get(f"user:{user_id}")
if not user:
    user = User.query.get(user_id)
    cache.set(f"user:{user_id}", user, ex=3600)  # Cache 1 hour

# 3. Count followers/following
followers = db.session.query(UserFollow).filter_by(following_id=user_id).count()
following = db.session.query(UserFollow).filter_by(follower_id=user_id).count()

# 4. Return user object
return {
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "followers_count": 42,
  "following_count": 100
}
```

### Example 4: Track User Interest

**Request** (authenticated):
```bash
curl -X POST http://localhost:8001/users/1/interests \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video",
    "entity_id": "vid_12345",
    "action": "watch",
    "metadata": {
      "duration_seconds": 1200,
      "watched_until": 600
    }
  }'
```

**Inside the service**:
```python
# 1. Verify JWT and get user_id
user_id = extract_user_from_token(request)

# 2. Validate interest data
assert interest_type in ["video", "audio", "post", "letter", "simulation"]
assert action in ["like", "watch", "save", "share"]

# 3. Store in database
interest = UserInterest(
  user_id=user_id,
  type="video",
  entity_id="vid_12345",
  action="watch",
  metadata={"duration_seconds": 1200, "watched_until": 600}
)
db.session.add(interest)
db.session.commit()

# 4. Publish event to message queue (Kafka/RabbitMQ)
message_bus.publish("user.interest.created", {
  "user_id": user_id,
  "interest": interest.to_dict()
})
# Analytics Service listens to this event

# 5. Invalidate cache
cache.delete(f"user:interests:{user_id}")

return interest.to_dict()
```

### Example 5: Follow User

**Request**:
```bash
curl -X POST http://localhost:8001/users/1/follow \
  -H "Authorization: Bearer eyJhbGci..." \
  -d '{"target_user_id": 2}'
```

**Inside the service**:
```python
# 1. Get authenticated user
follower_id = extract_user_from_token(request)
target_id = request.json["target_user_id"]

# 2. Validate
assert follower_id != target_id, "Can't follow yourself"
target = User.query.get(target_id)
assert target, "Target user doesn't exist"

# 3. Check if already following
existing = UserFollow.query.filter_by(
  follower_id=follower_id,
  following_id=target_id
).first()
if existing:
    raise AlreadyFollowingError()

# 4. Create follow relationship
follow = UserFollow(follower_id=follower_id, following_id=target_id)
db.session.add(follow)
db.session.commit()

# 5. Publish event
message_bus.publish("user.followed", {
  "follower_id": follower_id,
  "following_id": target_id
})

# 6. Invalidate caches
cache.delete(f"user:{follower_id}:following_count")
cache.delete(f"user:{target_id}:followers_count")

return { "status": "followed" }
```

---

## Integration with Other Services

### Content Service
```
User logs in → Token
   ↓
Requests posts from Content Service
   ↓
Sends token in Authorization header
   ↓
Content Service verifies with User Service
   ↓
Confirms user is authenticated
```

### Analytics Service
```
User watches video → publishes event
   ↓
Analytics Service consumes event
   ↓
"user.interest.created" event
   ↓
Analytics stores user behavior data
```

### Media Service
```
User uploads video → sends token
   ↓
Media Service validates user
   ↓
Checks if user is verified
   ↓
Allows/rejects upload
```

---

## Common Tasks

### Add New Field to User Profile
1. Create database migration: `alembic revision --autogenerate -m "add website field"`
2. Update User model: `website: str = Column(String(255))`
3. Update schemas: `website: Optional[str]`
4. Add endpoint update logic
5. Run migration: `alembic upgrade head`
6. Test: `pytest tests/test_users.py`

### Implement Password Reset
1. Create reset_token table
2. Send email with reset link
3. Validate token
4. Update password in database
5. Invalidate all sessions

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # 5 requests per minute
async def login(credentials):
    ...
```

---

## Key Takeaways

| Concept | Why It Matters |
|---------|---|
| **JWT Tokens** | Stateless auth, scales across services |
| **Password Hashing** | Never store raw passwords |
| **Middleware** | Verify auth before route handler |
| **Database Indexes** | Email, user_id lookups must be fast |
| **Event Publishing** | Other services react to user actions |
| **Redis Caching** | Reduce database hits, faster responses |
| **Separation of Concerns** | Cleaner code, easier testing |

---

## Next Steps
1. Start service with `fastapi run src/main.py`
2. Try endpoints at http://localhost:8001/docs
3. Write integration test (login → get profile)
4. Deploy with Docker → Kubernetes
