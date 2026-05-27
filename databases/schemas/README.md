# Database Schemas — Interview Prep & Tricky Points

Comprehensive schema definitions for all Persona platform databases. Each database is selected for its strength: **PostgreSQL** for relational integrity, **MongoDB** for flexibile documents, **Redis** for speed, **Elasticsearch** for search.

---

## Database Selection — Interview Questions

**Q: Why PostgreSQL over MySQL?**
A: Stronger ACID compliance, better JSON support (JSONB with indexing), richer indexing (GIN, GiST, BRIN), CTEs and window functions, extensions (PostGIS for geospatial, `pgvector` for embeddings), and more standards-compliant.

**Q: Why both PostgreSQL and MongoDB?**
A: PostgreSQL handles structured relational data (users, posts, likes) where referential integrity matters. MongoDB handles flexible documents (user content with varying fields, nested media arrays) where schema evolution is frequent. Polyglot persistence — use the right tool.

**Q: Why Redis when PostgreSQL can cache?**
A: Redis is an in-memory data structure store, not just a cache. It supports sorted sets (leaderboards), lists (feed queues), sets (unique likes), pub/sub (real-time), and TTL-based expiry. Sub-millisecond latency vs PostgreSQL's 1-10ms. Use Redis for hot-path data that changes frequently.

**Q: Why Elasticsearch instead of PostgreSQL full-text search?**
A: Elasticsearch is purpose-built for search: inverted indexes, tokenization analyzers, fuzzy matching, relevance scoring (BM25), faceted search, and near-real-time indexing. PostgreSQL's `tsvector` works for basic search but doesn't scale to complex queries or large text corpora.

---

## PostgreSQL — Interview Questions

**Q: Why use UUID primary keys instead of auto-increment integers?**
A: UUIDs are globally unique across services, databases, and distributed systems. They prevent ID collision in microservices, are safe to expose in URLs, and enable offline ID generation. Downside: 16 bytes vs 4 bytes, and random UUIDs cause index fragmentation (use UUID v7 for time-ordered).

**Q: Why `ON DELETE CASCADE` vs `SET NULL`?**
A: CASCADE: deleting a user deletes all their posts/comments/likes. Good for GDPR/user deletion. SET NULL: deleting a post sets `post_id` to NULL in comments — retains comments with "deleted" context. The choice depends on data retention policy.

**Q: Explain the `likes` table constraint design.**
A: The CHECK constraint ensures a like targets exactly one entity (post OR comment, not both). The UNIQUE constraint prevents duplicate likes. This is a clean polymorphic association pattern. Alternative: separate `post_likes` and `comment_likes` tables.

**Q: Why use `gen_random_uuid()` over `uuid_generate_v4()`?**
A: `gen_random_uuid()` is built into PostgreSQL 13+ (no extension needed). `uuid_generate_v4()` requires the `pgcrypto` extension. Both generate random UUIDs.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Soft deletes (`deleted_at`)** | Queries must filter `WHERE deleted_at IS NULL` everywhere. Easy to forget. Use views or row-level security. |
| **Index overuse** | Too many indexes slow writes. Each index adds O(log n) per INSERT/UPDATE. |
| **Missing composite indexes** | Querying `WHERE user_id = ? AND status = ?` needs a composite index on `(user_id, status)`. Separate indexes don't help. |
| **Dead tuples** | PostgreSQL uses MVCC — UPDATE creates a new row version. `VACUUM` reclaims space. Auto-vacuum must be tuned. |
| **Connection pool exhaustion** | Each service creates a pool. Too many connections → `FATAL: too many connections`. Set `max_connections` per service. |
| **JSONB vs relational** | Querying inside JSONB (`data->>'field'`) can't use standard B-tree indexes. Use GIN indexes for JSONB. |

---

## MongoDB — Interview Questions

**Q: Why TTL indexes for sessions?**
A: `expireAfterSeconds: 0` tells MongoDB to automatically delete documents when `expires_at` is reached. This eliminates the need for a cleanup cron job. MongoDB checks every 60 seconds.

**Q: Why store user content in MongoDB instead of PostgreSQL?**
A: User content has varied fields (raw_content, media_files array, nested metadata). A relational model would need multiple tables with JOINs. MongoDB stores it as a single document with embedded arrays — faster reads, simpler code.

**Q: Why indexes on `user_id + created_at`?**
A: The most common query is "get user X's content, sorted by date." A compound index on `(user_id, created_at)` covers both the filter and sort in one index scan. Without it, MongoDB sorts in memory (32MB limit).

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **No joins** | MongoDB is not relational. Embedding vs referencing is a critical design decision. Embed for one-to-few; reference for one-to-many/many-to-many. |
| **Document size limit** | 16MB per document. A user with 10,000 embedded comments would exceed this. Paginate with references instead. |
| **Write concern** | Default `w: 1` (ack from primary). For durability, use `w: majority`. For speed, `w: 0` (fire and forget). |
| **Read preference** | Secondary reads can return stale data. Use `readPreference: primaryPreferred` for read-your-writes consistency. |
| **No schema validation by default** | MongoDB accepts any fields. Use schema validation (JSON Schema in MongoDB 5+) or validate in application code. |

---

## Redis — Interview Questions

**Q: Why does every key have a TTL?**
A: Redis is memory-bound. TTLs prevent stale data accumulation and automatically evict old data. Without TTLs, the cache grows until `maxmemory` is hit, then eviction policy kicks in (LRU by default).

**Q: Why sorted sets for trending posts?**
A: Sorted sets store unique members with a score. `ZINCRBY trending:posts 1 post_id` increments the score atomically. `ZREVRANGE trending:posts 0 9` returns the top 10. This is O(log N + M) — extremely efficient for leaderboards and trending lists.

**Q: What happens if Redis goes down?**
A: Without persistence (RDB/AOF), all data is lost. With persistence, Redis reloads from disk on restart. For high availability, use Redis Sentinel or Redis Cluster. Services should degrade gracefully — fall back to database queries.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Cache stampede** | When a cached key expires and multiple requests simultaneously hit the DB. Fix: mutex locks, early recomputation, or probabilistic expiry. |
| **Key eviction** | When `maxmemory` is reached, Redis evicts by policy (LRU, LFU, TTL, random). Ensure your eviction policy matches the use case. |
| **Redis is single-threaded** | One slow command (KEYS, SMEMBERS on huge set) blocks all other requests. Never use KEYS in production — use SCAN. |
| **Data structure choice** | Wrong structure leads to complex code and poor performance. Use the right structure: Sets for uniqueness, Sorted Sets for ranking, Lists for queues, Hashes for objects. |

---

## Elasticsearch — Interview Questions

**Q: Why `keyword` + `text` dual mapping on `title`?**
A: `text` is analyzed (tokenized, lowercased, stemmed) for full-text search. `keyword` is not analyzed — used for exact matches, sorting, aggregations, and filtering. The `fields` parameter allows both on the same field.

**Q: Why 3 shards and 1 replica?**
A: Shards distribute data across nodes. 3 shards allows scaling to 3 nodes (each gets 1 shard). 1 replica provides redundancy. `refresh_interval: 30s` means data is searchable within 30s (vs 1s default — trades freshness for write throughput).

**Q: How do you reindex when the mapping changes?**
A: Elasticsearch doesn't allow changing field types. Create a new index with the correct mapping, reindex from the old index, then alias-switch. Zero-downtime migration via index aliases.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Mapping explosion** | Dynamic mapping creates unlimited fields. A malicious document with unique field names can crash the cluster. Disable dynamic mapping or set `dynamic: strict`. |
| **Deep pagination** | `from + size` with large values (>10,000) is expensive. Use `search_after` for deep pagination or `scroll` for bulk export. |
| **Relevance tuning** | Default BM25 may not match your domain. Tune with `boost`, `function_score`, or `learning_to_rank`. |
| **Near-real-time nature** | Data is searchable only after `refresh_interval`. For read-after-write consistency, force refresh or use `?refresh=wait_for`. |

---

## Backup & Recovery — Interview Questions

**Q: Why `pg_dump` vs file-system backup?**
A: `pg_dump` is logical — portable across PostgreSQL versions and architectures. File-system backup (`pg_start_backup` + rsync) is faster for large databases but version-specific. Use `pg_dump` for small DBs, physical backup for large (>100GB).

**Q: What's the difference between RDB and AOF in Redis?**
A: RDB is a point-in-time snapshot (compact, fast recovery, may lose data). AOF is an append-only log of every write operation (durable, larger, slower recovery). Use both: RDB for base + AOF for precision.

**Q: How do you test backups?**
A: Restore to a staging environment periodically. A backup that's never tested is not a backup. Automate restoration testing as part of the deployment pipeline.
