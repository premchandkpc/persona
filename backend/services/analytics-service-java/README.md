# Analytics Service (Java) — Interview Prep & Tricky Points

User behavior tracking and analytics service built with **Java + Spring Boot**.

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Spring Boot | Mature, DI, auto-config, vast ecosystem |
| Database | PostgreSQL | Aggregated analytics data |
| Messaging | Kafka/RabbitMQ | Event ingestion buffer |
| Search | Elasticsearch | Analytics queries, log search |
| Build | Maven | Standard Java build tool |

---

## Interview Questions

### Java / Spring Boot

**Q: Why Spring Boot over other Java frameworks?**
A: Auto-configuration (minimal boilerplate), dependency injection, embedded Tomcat (no external server needed), actuator (health checks, metrics), and the massive Spring ecosystem (Security, Data, Cloud, Batch). Downside: slower startup, heavy memory footprint.

**Q: What is dependency injection and why use it?**
A: DI inverts control — instead of a class creating its dependencies, they're injected by the framework. This makes classes testable (swap real DB for mock), loosely coupled, and configurable (different implementations per environment). Spring uses `@Autowired` or constructor injection.

**Q: `@Component` vs `@Service` vs `@Repository`?**
A: `@Component` — generic Spring-managed bean. `@Service` — business logic layer (semantic marker). `@Repository` — data access layer (Spring adds persistence exception translation). All do the same thing functionally — the distinction is semantic and aids readability.

### Event Processing / Kafka

**Q: Why Kafka for analytics?**
A: Kafka provides durable, ordered, replayable event streams. Analytics events can be consumed at any speed without losing data. If the analytics service is down, Kafka retains the events until it's back. This is the key difference from synchronous HTTP — event sources are decoupled from consumers.

**Q: What is a consumer group in Kafka?**
A: A consumer group allows multiple consumers to parallelize processing of a topic. Each partition is assigned to exactly one consumer in the group. If a consumer fails, its partitions are reassigned (rebalancing). This enables horizontal scaling of event processing.

**Q: At-least-once vs exactly-once semantics?**
A: At-least-once: events may be processed twice (duplicates). Exactly-once: each event is processed exactly once (requires idempotent producers + transactional consumers). Analytics often uses at-least-once with deduplication by event ID, because exactly-once adds significant performance overhead.

### CQRS / Event Sourcing

**Q: What is CQRS?**
A: Command Query Responsibility Segregation — separate the write model (commands) from the read model (queries). Writes use the relational model (normalized, transactional). Reads use a denormalized model optimized for queries (materialized views, Elasticsearch). This allows independent scaling of reads and writes.

**Q: When would you use Event Sourcing?**
A: When you need a complete audit trail (every state change is an event), temporal queries (what was the state at time T?), or complex event-driven workflows. Analytics billing/tracking is a good fit. Trade-off: complexity — you need event store, snapshotting, and event versioning.

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Spring Boot auto-config surprises** | Adding a dependency auto-enables features (e.g., `spring-boot-starter-data-jpa` auto-creates tables) | Explicitly disable auto-config for features you don't want |
| **Kafka consumer offset management** | If processing fails after commit, the event is lost | Process then commit (or use manual commit with error handling) |
| **LazyInitializationException** | Accessing a lazy-loaded JPA relationship outside a transaction | Use `@Transactional` or eager fetch explicitly |
| **Blocking calls in reactive streams** | Calling a blocking API inside a reactive stream blocks the thread pool | Use `blocking()` wrapper or dedicate a separate thread pool |
| **Memory leaks from event processing** | Processing millions of events without batching leads to OOM | Use sliding windows, batch commits, and backpressure |
| **Time zone confusion** | Analytics timestamps without time zone give wrong daily/weekly aggregations | Always store UTC. Convert to local time in the presentation layer. |

## System Design Questions

**Q: Design an event tracking pipeline for 10M events/day.**
A: Events → Kafka (topic per event type, 12 partitions) → Analytics service (Spring Boot, consumer group with 6 instances) → PostgreSQL (aggregated hourly) + Elasticsearch (ad-hoc queries). Use Redis for real-time counters (active users, page views). Batch rollups to PostgreSQL every hour.

**Q: How do you prevent double counting from duplicate events?**
A: Each event has a unique ID (UUID v7). The consumer stores processed IDs in Redis (TTL 24h). If a duplicate event arrives, the ID exists in Redis → skip. This is idempotent consumption with deduplication.
