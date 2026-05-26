# Database Schemas

Comprehensive schema definitions for all services in the Persona platform.

## Databases Overview

| Database | Purpose | Type |
| --- | --- | --- |
| **PostgreSQL** | Relational data (users, posts, comments, analytics) | Relational |
| **MongoDB** | Document storage (user content, media metadata, logs) | Document |
| **Redis** | Caching, sessions, real-time data | In-Memory Cache |
| **Elasticsearch** | Full-text search, analytics, logging | Search Engine |

---

## PostgreSQL Schemas

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Relationships:**
- One user → Many posts
- One user → Many comments
- One user → Many followers

---

### posts table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(255),
  status VARCHAR(50) DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_is_featured ON posts(is_featured);
```

**Relationships:**
- Many posts → One user
- One post → Many comments
- One post → Many likes

---

### comments table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
```

**Relationships:**
- Many comments → One post
- Many comments → One user
- Self-referencing for nested comments

---

### likes table
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT like_unique UNIQUE(user_id, post_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_comment_id ON likes(comment_id);
```

---

### followers table
```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT follower_unique UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
```

---

### analytics table
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_post_id ON analytics(post_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
```

---

## MongoDB Schemas

### users_content collection
```json
{
  "_id": ObjectId,
  "user_id": "UUID",
  "content_type": "text|image|video|mixed",
  "raw_content": {},
  "media_files": [
    {
      "file_id": "UUID",
      "url": "string",
      "mime_type": "string",
      "size_bytes": "number",
      "uploaded_at": "ISODate"
    }
  ],
  "tags": ["tag1", "tag2"],
  "metadata": {
    "word_count": "number",
    "language": "string",
    "sentiment": "positive|negative|neutral"
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes:**
```javascript
db.users_content.createIndex({ user_id: 1, created_at: -1 });
db.users_content.createIndex({ tags: 1 });
db.users_content.createIndex({ "metadata.language": 1 });
```

---

### user_sessions collection
```json
{
  "_id": ObjectId,
  "user_id": "UUID",
  "session_token": "string",
  "device_info": {
    "user_agent": "string",
    "ip_address": "string",
    "device_type": "mobile|desktop|tablet"
  },
  "last_activity": "ISODate",
  "expires_at": "ISODate",
  "is_active": "boolean",
  "created_at": "ISODate"
}
```

**TTL Index:**
```javascript
db.user_sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
db.user_sessions.createIndex({ user_id: 1 });
db.user_sessions.createIndex({ session_token: 1 });
```

---

### notifications collection
```json
{
  "_id": ObjectId,
  "user_id": "UUID",
  "type": "like|comment|follow|mention",
  "actor_id": "UUID",
  "target_id": "UUID",
  "message": "string",
  "is_read": "boolean",
  "read_at": "ISODate",
  "created_at": "ISODate"
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ user_id: 1, is_read: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, created_at: -1 });
```

---

## Redis Schemas

### Key Patterns & TTL

| Pattern | Type | TTL | Purpose |
| --- | --- | --- | --- |
| `user:{user_id}` | Hash | 24h | User profile cache |
| `post:{post_id}` | Hash | 12h | Post data cache |
| `session:{session_token}` | Hash | 30d | User session |
| `trending:posts` | Sorted Set | 1h | Top trending posts |
| `user:{user_id}:feed` | List | 6h | User's feed (paginated) |
| `post:{post_id}:comments` | List | 4h | Post comments cache |
| `likes:post:{post_id}` | Set | 2h | Post likes (IDs) |
| `followers:{user_id}` | Set | 24h | User followers |
| `rate_limit:{user_id}:{endpoint}` | String | 1m | API rate limit |

### Example Cache Operations

```redis
# User profile
HSET user:user_uuid name "John" email "john@example.com" bio "Developer"
EXPIRE user:user_uuid 86400

# Trending posts (sorted by score)
ZADD trending:posts 1000 post_id_1 950 post_id_2
EXPIRE trending:posts 3600

# Session
HSET session:token_uuid user_id user_uuid created_at 1234567890
EXPIRE session:token_uuid 2592000

# Feed cache
RPUSH user:user_uuid:feed post_id_1 post_id_2 post_id_3
EXPIRE user:user_uuid:feed 21600
```

---

## Elasticsearch Schemas

### posts index mapping
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "content": { "type": "text" },
      "summary": { "type": "text" },
      "tags": { "type": "keyword" },
      "status": { "type": "keyword" },
      "view_count": { "type": "integer" },
      "like_count": { "type": "integer" },
      "is_featured": { "type": "boolean" },
      "published_at": { "type": "date" },
      "created_at": { "type": "date" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "30s"
  }
}
```

### users index mapping
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "username": { "type": "keyword" },
      "email": { "type": "keyword" },
      "first_name": { "type": "text" },
      "last_name": { "type": "text" },
      "bio": { "type": "text" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

## Database Connections

### Environment Variables
```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/persona_db
DB_POOL_SIZE=20

# MongoDB
MONGODB_URI=mongodb://user:password@localhost:27017/persona
MONGODB_POOL_SIZE=10

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CLUSTER=false

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

---

## Migration Commands

### PostgreSQL (Alembic - Python)
```bash
# Create migration
alembic revision --autogenerate -m "Add users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# Show current version
alembic current
```

### PostgreSQL (Flyway - Java)
```bash
# Validate
mvn flyway:validate

# Migrate
mvn flyway:migrate

# Info
mvn flyway:info

# Clean (CAUTION)
mvn flyway:clean
```

### MongoDB
```bash
# No migrations needed - schema-less
# Apply changes via application code or manual scripts
# Use MongoDB Atlas for cloud deployments
```

### Redis
```bash
# No migrations - ephemeral data
# Use Redis modules/scripts as needed
redis-cli < /path/to/setup.redis
```

### Elasticsearch
```bash
# Create index with mapping
curl -X PUT "localhost:9200/posts" -H 'Content-Type: application/json' -d @mapping.json

# Update mapping (limited)
curl -X PUT "localhost:9200/posts/_mapping" -H 'Content-Type: application/json' -d '...'

# Delete index
curl -X DELETE "localhost:9200/posts"
```

---

## Backup & Recovery

### PostgreSQL
```bash
# Backup
pg_dump -U user -h localhost persona_db > backup.sql

# Restore
psql -U user -h localhost persona_db < backup.sql
```

### MongoDB
```bash
# Backup
mongodump --uri="mongodb://user:password@localhost:27017/persona"

# Restore
mongorestore dump/
```

### Redis
```bash
# Backup (RDB)
redis-cli BGSAVE

# Backup (AOF)
redis-cli BGREWRITEAOF
```

---

## Maintenance

- **PostgreSQL:** Vacuum tables weekly, analyze for query optimization
- **MongoDB:** Rebuild indexes monthly, monitor collection size
- **Redis:** Monitor memory usage, set maxmemory policy
- **Elasticsearch:** Rotate indices daily/weekly, monitor shard allocation
