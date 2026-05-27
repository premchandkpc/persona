# Content Service (Go) — Interview Prep & Tricky Points

Content management service for posts, letters, and Instagram content built with **Go**.

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Gin/Chi | Minimal, fast HTTP router |
| Database | PostgreSQL | Relational data with complex queries |
| Search | Elasticsearch | Full-text search, feed generation |
| Language | Go | Fast compile, goroutines, static binary |

---

## Interview Questions

### Go Language

**Q: Why Go for a content service?**
A: Go excels at I/O-bound services with high concurrency. Goroutines are lightweight (2KB stack, millions per process) vs Java threads (1MB+). Channels enable safe communication between goroutines. Static binaries simplify deployment. Compile times are fast — edit → test → deploy in seconds.

**Q: What are goroutines and how are they different from threads?**
A: Goroutines are user-space "green threads" managed by the Go runtime. They start with ~2KB stack (grows/shrinks as needed) vs OS threads with 1MB+ fixed stack. Switching goroutines is cheaper than thread context switching. GOMAXPROCS controls how many OS threads run Go code concurrently.

**Q: What is the difference between `sync.Mutex` and channels?**
A: Mutexes protect shared state. Channels pass data between goroutines. Go's philosophy: "Don't communicate by sharing memory; share memory by communicating." For the content service, channels are preferred for pipeline patterns (fetch → process → respond), mutexes for protecting in-memory caches.

### Concurrency Patterns

**Q: How do you implement a fan-out/fan-in pattern for feed generation?**
A: A fan-out goroutine fetches candidate posts for a user's feed (from followers, hashtags, trending) and sends each candidate to a worker channel. Multiple worker goroutines score/filter/rank posts concurrently. A fan-in goroutine collects ranked results and merges them into the final feed.

**Q: How do you handle graceful shutdown in Go?**
A: Listen for `SIGINT`/`SIGTERM` via `signal.Notify(ctx)`. On signal: stop accepting new requests, drain in-flight requests (with a timeout), close database connections, then exit. Gin/Chi support this via `server.Shutdown(ctx)`.

### Elasticsearch / Search

**Q: How do you implement typeahead/search-as-you-type?**
A: Create an Elasticsearch `completion` suggester on the title/tags field. The endpoint accepts a partial query and returns completions in milliseconds. For full-text search, use `multi_match` across title, content, and tags fields with relevance boosting on title.

**Q: How does feed ranking work?**
A: Combine recency (`published_at`), popularity (`like_count`, `view_count`), and relevance (matching user interests). A simple formula: `score = log(like_count + 1) * 0.3 + recency_boost * 0.5 + interest_match * 0.2`. For production, use ML-based ranking (Learning to Rank).

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Goroutine leaks** | A goroutine blocked on channel send with no receiver never exits | Ensure every send has a corresponding receive. Use context cancellation. |
| **Database connection pool exhaustion** | Opening a new connection per goroutine without pooling | Use `sql.DB` with `SetMaxOpenConns()` and `SetMaxIdleConns()` |
| **Elasticsearch index mapping conflict** | Dynamic mapping infers a field as `text` but you need `keyword` | Define explicit mappings before indexing data |
| **Incorrect pagination with Cursor** | Using `OFFSET` pagination has drift if data changes | Use cursor-based pagination (`WHERE id > last_seen_id`) for stable feeds |
| **JSON field case sensitivity** | Go struct fields must be exported (capitalized) for JSON encoding | Use `json:"snake_case"` tags for consistent API responses |
| **Request context cancellation** | Client disconnects mid-request, but Go continues processing | Use `request.Context()` and check `ctx.Done()` in long operations |

## Common Go Patterns

```go
// Graceful shutdown
func main() {
    r := gin.Default()
    srv := &http.Server{Addr: ":8002", Handler: r}
    go srv.ListenAndServe()
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    srv.Shutdown(ctx)
}
```
