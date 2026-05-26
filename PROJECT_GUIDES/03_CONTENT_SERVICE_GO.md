# Content Service (Go) - Complete Guide

**Project**: Post, Letter, and Content Management Microservice
**Language**: Go
**Difficulty**: Intermediate
**Time**: 3-4 hours to understand
**Location**: `/persona/backend/services/content-service-go/`
**Port**: 8002

---

## Table of Contents
1. [What Does It Do?](#what-does-it-do)
2. [Why Go?](#why-go)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [How to Run](#how-to-run)
7. [Concurrency Patterns](#concurrency-patterns)
8. [Examples](#examples)

---

## What Does It Do?

**TL;DR**: Manages user-generated content: posts, letters, comments, hashtags, and search.

### Responsibilities
- Create, read, update, delete (CRUD) posts
- Letter system (personal writing)
- Comments & replies
- Hashtag management & trending
- Content search (via Elasticsearch)
- Feed generation
- Content recommendations metadata

### What It Does NOT Do
- User authentication (User Service)
- Media file storage (Media Service)
- Analytics (Analytics Service)

### Domain Model
```
Post (what users share publicly)
├── id
├── author_id (from User Service)
├── content
├── hashtags
├── images/videos (references, Media Service handles storage)
├── created_at
└── likes_count, comments_count, shares_count

Letter (personal writing, shared with specific users)
├── id
├── author_id
├── recipient_id
├── content
├── is_private
└── created_at

Comment
├── id
├── post_id (which post)
├── author_id
├── content
└── created_at
```

---

## Why Go?

### Characteristics
Go is ideal for this service because:

**1. Concurrency is Built-in**
```go
// Handle 10,000 concurrent requests without threads
// Go uses goroutines (lightweight threads)
go func() {
    response := fetchUserData(userID)
    processFeed(response)
}()  // Takes ~1-2 KB memory vs 1-2 MB for OS thread
```

**2. High Performance**
```
Go:      ~10,000 req/sec
Python:  ~2,000 req/sec
Node:    ~5,000 req/sec
```

**3. Compiled Binary**
- Single executable file
- No runtime dependencies
- Fast startup
- Easy deployment

**4. Excellent for I/O-Heavy Work**
```
Feed system needs:
1. Query posts from database
2. Fetch author info from User Service
3. Get media URLs from Media Service
4. Search comments in Elasticsearch
5. Combine and return

Go handles this efficiently without blocking threads
```

---

## Tech Stack

### Gin Web Framework
```go
// Lightweight HTTP router
router := gin.Default()

router.GET("/posts", getPosts)
router.POST("/posts", createPost)
router.PUT("/posts/:id", updatePost)
router.DELETE("/posts/:id", deletePost)

router.Run(":8002")
```

**Why Gin?**
- Fast routing
- Middleware support
- Error handling
- Built-in logging

### PostgreSQL
```sql
-- Relational data, consistent schema
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Elasticsearch
```
Fast full-text search

Index: posts
├── id
├── content (searchable)
├── author_id
├── hashtags (searchable)
└── created_at

Query: "golang" → returns matching posts instantly
vs PostgreSQL: SELECT ... WHERE content LIKE '%golang%'
(slow, needs sequential scan)
```

### Redis
```go
// Cache popular posts
const (
  TTL = 3600  // 1 hour
)

cache.Set("trending:posts", trendsJSON, TTL)
cache.Set("post:detail:123", postJSON, TTL)
```

---

## Architecture

### Folder Structure
```
content-service-go/
├── cmd/
│   └── main.go              # Entry point
│
├── internal/
│   ├── handlers/
│   │   ├── posts.go         # POST/GET/PUT/DELETE posts
│   │   ├── letters.go       # Letter endpoints
│   │   ├── comments.go      # Comment endpoints
│   │   └── search.go        # Search endpoints
│   │
│   ├── models/
│   │   ├── post.go          # Post struct
│   │   ├── letter.go        # Letter struct
│   │   └── comment.go       # Comment struct
│   │
│   ├── services/
│   │   ├── post_service.go  # Business logic
│   │   ├── feed_service.go  # Feed generation
│   │   └── search_service.go # Elasticsearch ops
│   │
│   ├── repositories/
│   │   ├── post_repo.go     # Database queries
│   │   ├── letter_repo.go
│   │   └── comment_repo.go
│   │
│   ├── middleware/
│   │   ├── auth.go          # Verify JWT with User Service
│   │   ├── logging.go       # Request logging
│   │   └── errors.go        # Error handling
│   │
│   ├── cache/
│   │   └── redis.go         # Redis operations
│   │
│   ├── external/
│   │   ├── user_client.go   # Call User Service
│   │   ├── media_client.go  # Call Media Service
│   │   └── kafka.go         # Event publishing
│   │
│   └── config/
│       └── config.go        # Environment vars
│
├── pkg/
│   ├── logger.go
│   └── errors.go
│
├── go.mod                   # Dependency manifest
├── go.sum                   # Dependency checksums
├── Dockerfile
└── README.md
```

### Request Flow
```
HTTP Request (GET /posts/trending)
    ↓
[Gin Router] matches route
    ↓
[Auth Middleware] verifies JWT
    ↓
[Logging Middleware] logs request
    ↓
[Handler] getTrendingPosts()
    ├─→ Check cache (Redis)
    │   ├→ Hit: return cached
    │   └→ Miss: continue
    ├─→ Call service layer
    ├─→ Service queries database
    ├─→ Service enriches with author info (User Service)
    ├─→ Service caches result
    └─→ Return JSON response
    ↓
Response (JSON with posts)
```

### Concurrency Example
```go
// Fetch multiple posts & their authors concurrently

func GetPostsWithAuthors(postIDs []int64) ([]PostWithAuthor, error) {
    results := make([]PostWithAuthor, len(postIDs))
    errors := make([]error, len(postIDs))
    
    var wg sync.WaitGroup
    
    for i, id := range postIDs {
        wg.Add(1)
        go func(index int, postID int64) {
            defer wg.Done()
            
            // Fetch post
            post, err := db.GetPost(postID)
            if err != nil {
                errors[index] = err
                return
            }
            
            // Fetch author (can run in parallel)
            author, err := userServiceClient.GetUser(post.AuthorID)
            if err != nil {
                errors[index] = err
                return
            }
            
            results[index] = PostWithAuthor{Post: post, Author: author}
        }(i, id)
    }
    
    wg.Wait()  // Wait for all goroutines
    
    // Check for errors
    for _, err := range errors {
        if err != nil {
            return nil, err
        }
    }
    
    return results, nil
}

// Sequential (bad): 5 posts × 100ms = 500ms
// Concurrent (good): max(100ms, 100ms...) = 100ms ✓
```

---

## API Endpoints

### Posts

**Create Post**
```
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Just learned Go! #golang #programming",
  "hashtags": ["golang", "programming"],
  "image_ids": ["img_123", "img_456"],
  "visibility": "public"  // public, private, friends_only
}

Response:
{
  "id": 789,
  "author_id": 1,
  "content": "Just learned Go! #golang #programming",
  "hashtags": ["golang", "programming"],
  "image_ids": ["img_123", "img_456"],
  "created_at": "2026-01-20T10:30:00Z",
  "likes_count": 0,
  "comments_count": 0
}
```

**Get Posts Feed**
```
GET /posts?limit=20&offset=0&filter=following

Response:
{
  "posts": [
    {
      "id": 789,
      "author": {
        "id": 1,
        "name": "Alice",
        "avatar_url": "..."
      },
      "content": "...",
      "likes_count": 42,
      "comments_count": 5,
      "created_at": "2026-01-20T10:30:00Z"
    },
    ...
  ],
  "total": 342,
  "has_more": true
}
```

**Search Posts**
```
GET /posts/search?q=golang&limit=10

Query: "golang" → Elasticsearch finds all posts containing "golang"

Response:
{
  "results": [
    { "id": 789, "content": "...", "score": 9.5 },
    { "id": 790, "content": "...", "score": 8.2 },
    ...
  ]
}
```

**Get Trending Hashtags**
```
GET /trending/hashtags?limit=10

Response:
{
  "hashtags": [
    { "tag": "#golang", "count": 1240 },
    { "tag": "#programming", "count": 980 },
    { "tag": "#webdev", "count": 750 },
    ...
  ]
}
```

### Letters

**Create Letter**
```
POST /letters
Authorization: Bearer {token}

{
  "recipient_id": 2,
  "content": "Dear Sarah, ...",
  "is_private": true
}

Response:
{
  "id": 456,
  "author_id": 1,
  "recipient_id": 2,
  "content": "Dear Sarah, ...",
  "is_private": true,
  "read_at": null,
  "created_at": "2026-01-20T11:00:00Z"
}
```

**Get Letters**
```
GET /letters?folder=inbox

Response:
{
  "letters": [
    {
      "id": 456,
      "author": { "id": 1, "name": "Alice" },
      "content": "...",
      "read_at": null,
      "created_at": "2026-01-20T11:00:00Z"
    },
    ...
  ]
}
```

### Comments

**Create Comment**
```
POST /posts/{post_id}/comments
Authorization: Bearer {token}

{
  "content": "Great post!"
}

Response:
{
  "id": 123,
  "post_id": 789,
  "author_id": 2,
  "content": "Great post!",
  "created_at": "2026-01-20T11:15:00Z"
}
```

**Get Comments**
```
GET /posts/{post_id}/comments?limit=20

Response:
{
  "comments": [
    {
      "id": 123,
      "author": { "id": 2, "name": "Bob" },
      "content": "Great post!",
      "likes_count": 3,
      "created_at": "2026-01-20T11:15:00Z"
    },
    ...
  ]
}
```

---

## How to Run

### Prerequisites
```bash
# Go 1.20+
go version

# PostgreSQL
psql --version

# Elasticsearch
curl localhost:9200

# Redis
redis-cli ping
```

### Setup
```bash
cd /persona/backend/services/content-service-go

# Initialize module (if new)
go mod init github.com/persona/content-service

# Install dependencies
go get -u ./...

# Create .env
cat > .env << EOF
DATABASE_URL=postgres://user:pass@localhost/persona_content
ELASTICSEARCH_URL=http://localhost:9200
REDIS_URL=redis://localhost:6379
PORT=8002
JWT_SECRET=your_secret
USER_SERVICE_URL=http://localhost:8001
KAFKA_BROKERS=localhost:9092
EOF

# Create database
createdb persona_content

# Run migrations
psql -d persona_content -f migrations/001_init.sql
```

### Run Service
```bash
# Development (with auto-reload)
go run cmd/main.go

# OR with hot reload (install: go install github.com/cosmtrek/air@latest)
air

# Build binary
go build -o content-service cmd/main.go
./content-service

# View API docs
curl http://localhost:8002/swagger/index.html
```

### Run Tests
```bash
go test ./...

# With coverage
go test -cover ./...

# Verbose
go test -v ./...
```

---

## Concurrency Patterns

### Pattern 1: WaitGroup (Fan-out/Fan-in)
```go
// Fetch multiple resources in parallel

func enrichPosts(postIDs []int64) ([]Post, error) {
    var wg sync.WaitGroup
    results := make([]Post, len(postIDs))
    
    for i, id := range postIDs {
        wg.Add(1)
        go func(idx int, postID int64) {
            defer wg.Done()
            post, _ := db.GetPost(postID)
            post.Author, _ = userClient.GetUser(post.AuthorID)
            results[idx] = post
        }(i, id)
    }
    
    wg.Wait()
    return results, nil
}
```

### Pattern 2: Channels (Producer-Consumer)
```go
// Stream posts without loading all into memory

func StreamPosts(writer http.ResponseWriter) {
    posts := make(chan Post, 10)  // Buffered channel
    
    go func() {
        defer close(posts)
        rows, _ := db.Query("SELECT * FROM posts")
        for rows.Next() {
            post := Post{}
            rows.Scan(&post.ID, &post.Content, ...)
            posts <- post  // Send to channel
        }
    }()
    
    for post := range posts {
        json.NewEncoder(writer).Encode(post)
    }
}
```

### Pattern 3: Context for Cancellation
```go
// Cancel operations if client disconnects or timeout

func SearchPosts(ctx context.Context, query string) ([]Post, error) {
    // Create timeout
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    results := make([]Post, 0)
    
    // Elasticsearch query with context
    res, err := es.Search(
        es.Search.WithContext(ctx),
        es.Search.WithIndex("posts"),
        es.Search.WithBody(queryBody),
    )
    
    if err != nil {
        return nil, err
    }
    
    return results, nil
}
```

---

## Examples

### Example 1: Create Post with Hashtags

**Request**:
```bash
curl -X POST http://localhost:8002/posts \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Learning Go is awesome! #golang #backend",
    "hashtags": ["golang", "backend"],
    "visibility": "public"
  }'
```

**Inside the service**:
```go
// handlers/posts.go
func (h *PostHandler) CreatePost(c *gin.Context) {
    // 1. Extract user from JWT
    userID := c.GetInt64("user_id")
    
    // 2. Parse request
    var req CreatePostRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // 3. Validate
    if len(req.Content) == 0 || len(req.Content) > 5000 {
        c.JSON(400, gin.H{"error": "content must be 1-5000 chars"})
        return
    }
    
    // 4. Create post
    post := &models.Post{
        AuthorID:  userID,
        Content:   req.Content,
        Hashtags:  req.Hashtags,
        Visibility: req.Visibility,
        CreatedAt: time.Now(),
    }
    
    // 5. Save to database
    if err := h.postRepo.Create(context.Background(), post); err != nil {
        c.JSON(500, gin.H{"error": "failed to create post"})
        return
    }
    
    // 6. Index in Elasticsearch (for search)
    go func() {
        h.searchService.IndexPost(context.Background(), post)
    }()  // Don't wait, async
    
    // 7. Publish event (Analytics Service, Feed Service listen)
    go func() {
        h.eventBus.Publish("post.created", PostCreatedEvent{
            PostID:    post.ID,
            AuthorID:  post.AuthorID,
            Hashtags:  post.Hashtags,
            CreatedAt: post.CreatedAt,
        })
    }()
    
    // 8. Return response
    c.JSON(201, post)
}
```

### Example 2: Get Feed with Concurrency

**Request**:
```bash
curl "http://localhost:8002/posts?limit=20" \
  -H "Authorization: Bearer eyJhbGci..."
```

**Inside the service**:
```go
// services/feed_service.go
func (s *FeedService) GetUserFeed(ctx context.Context, userID int64) ([]PostWithAuthor, error) {
    // 1. Get posts from database
    posts, err := s.postRepo.GetFeedPosts(ctx, userID, 20)
    if err != nil {
        return nil, err
    }
    
    // 2. Enrich posts with author info (concurrent)
    results := make([]PostWithAuthor, len(posts))
    var wg sync.WaitGroup
    errsChan := make(chan error, len(posts))
    
    for i, post := range posts {
        wg.Add(1)
        go func(idx int, p *models.Post) {
            defer wg.Done()
            
            // Fetch author from User Service
            author, err := s.userClient.GetUser(ctx, p.AuthorID)
            if err != nil {
                errsChan <- err
                return
            }
            
            results[idx] = PostWithAuthor{
                Post:   p,
                Author: author,
            }
        }(i, post)
    }
    
    wg.Wait()
    close(errsChan)
    
    // 3. Check for errors
    for err := range errsChan {
        if err != nil {
            return nil, err
        }
    }
    
    // 4. Return enriched feed
    return results, nil
}
```

### Example 3: Search Posts

**Request**:
```bash
curl "http://localhost:8002/posts/search?q=golang&limit=10"
```

**Inside the service**:
```go
// services/search_service.go
func (s *SearchService) SearchPosts(ctx context.Context, query string) ([]Post, error) {
    // 1. Create Elasticsearch query (full-text search)
    body := map[string]interface{}{
        "query": map[string]interface{}{
            "multi_match": map[string]interface{}{
                "query":  query,
                "fields": []string{"content", "hashtags"},
            },
        },
        "size": 10,
    }
    
    // 2. Marshal to JSON
    jsonBody, _ := json.Marshal(body)
    
    // 3. Execute search
    res, err := s.es.Search(
        s.es.Search.WithContext(ctx),
        s.es.Search.WithIndex("posts"),
        s.es.Search.WithBody(bytes.NewReader(jsonBody)),
    )
    if err != nil {
        return nil, err
    }
    
    defer res.Body.Close()
    
    // 4. Parse response
    var esResp map[string]interface{}
    json.NewDecoder(res.Body).Decode(&esResp)
    
    hits := esResp["hits"].(map[string]interface{})["hits"].([]interface{})
    
    results := make([]Post, len(hits))
    for i, hit := range hits {
        source := hit.(map[string]interface{})["_source"].(map[string]interface{})
        // Unmarshal to Post struct
        json.Unmarshal(json.Marshal(source), &results[i])
    }
    
    return results, nil
}
```

---

## Key Concepts

### Goroutines
- Lightweight threads (~1-2 KB memory)
- Thousands can run concurrently
- Scheduler multiplexes onto OS threads

### Channels
- Typed pipes for communication
- Safe concurrent access
- `<-` operator sends/receives

### Interfaces
```go
// Hide implementation details
type Repository interface {
    Create(ctx context.Context, post *Post) error
    GetByID(ctx context.Context, id int64) (*Post, error)
    Update(ctx context.Context, post *Post) error
    Delete(ctx context.Context, id int64) error
}

// PostgreSQL implementation
type PostgresRepository struct { /* ... */ }
func (r *PostgresRepository) Create(ctx context.Context, post *Post) error { /* ... */ }

// MongoDB implementation (if needed)
type MongoRepository struct { /* ... */ }
func (r *MongoRepository) Create(ctx context.Context, post *Post) error { /* ... */ }

// Code uses Repository interface, doesn't care which implementation
```

---

## Next Steps
1. Run service: `go run cmd/main.go`
2. Try endpoints at http://localhost:8002/docs
3. Understand: goroutines, channels, interfaces
4. Write concurrent test
5. Deploy to Kubernetes
