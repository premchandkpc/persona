# Root README — Interview Prep & Tricky Points

> This file augments the project-level README at `/README.md`. Use it alongside the main README for interview preparation.

## Microservices Architecture — Interview Questions

**Q: Why microservices over a monolith?**
A: Independent scaling, polyglot stacks, isolated failure domains, team autonomy, faster deployments. Trade-offs: network latency, distributed consistency, operational complexity, debug difficulty. For Persona, each service uses the best language for its domain (Rust for compute, Node.js for I/O, Python for ML).

**Q: How do services communicate?**
A: Synchronous via gRPC (internal) + REST (external). Async via Kafka/RabbitMQ. gRPC uses Protocol Buffers for typed, efficient serialization. Kafka enables event-driven patterns — services publish events without knowing who consumes them.

**Q: How do you handle distributed transactions?**
A: Avoid them. Use the Saga pattern — a sequence of local transactions with compensating actions on failure. For example: create user → send welcome email. If email fails, roll back user creation. Two-phase commit (2PC) is rarely used due to blocking and complexity.

**Q: How do you ensure data consistency across services?**
A: Each service owns its database (database-per-service pattern). Cross-service reads use API calls or a materialized view. For eventual consistency: async events + idempotent handlers. For strong consistency: use a single service or a distributed transaction coordinator (rare).

## Common Pitfalls

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Database-per-service complexity** | JOINs across services become API calls, leading to N+1 queries | Aggregation service, CQRS, or shared read-replica |
| **Network flakiness** | Services assume reliable network; a transient failure cascades | Retries with exponential backoff, circuit breakers, timeouts |
| **Lack of observability** | Debugging across 5+ services without distributed tracing is impossible | Jaeger/Zipkin traces, structured logging with request IDs |
| **Wrong service boundaries** | Services split by technical layer (not domain) cause chatty communication | Organize by business domain (DDD bounded contexts) |
| **Shared libraries** | Updating a shared proto/utils file requires coordinated deploys | Version protos, backward-compatible changes |
| **Schema drift** | Microservices evolve independently; a producer changes a field consumers expect | Schema registry, contract testing, consumer-driven contracts |

## System Design Questions

**Q: Design the user service for 10M users.**
A: Stateless API layer behind a load balancer. PostgreSQL with read replicas + connection pooling (PgBouncer). Redis for session cache (30min TTL). Rate limiting per user. CQRS for read/write separation if needed.

**Q: How would you handle a traffic spike?**
A: Horizontal auto-scaling (HPA in K8s), CDN for static content, rate limiting at the gateway, caching (Redis) for hot data, queue-based load leveling (Kafka buffers spikes), and circuit breakers to fail fast.

**Q: How do you handle blue-green deployments?**
A: Two identical environments (blue = live, green = new). Switch traffic at the load balancer after health checks pass. Instant rollback by switching back. Requires double the resources briefly.

## Key Concepts Cheat Sheet

- **Saga Pattern**: Chain of local transactions, each with compensating action on failure
- **CQRS**: Separate read models from write models for independent scaling
- **Event Sourcing**: Store events as the source of truth, derive current state by replaying
- **Idempotency**: Same request processed multiple times produces the same result
- **Circuit Breaker**: Fail fast when a downstream service is unhealthy
- **Bulkhead**: Isolate resources per service/tenant to prevent cascading failures
- **Graceful Degradation**: Return cached/stale data when a dependency fails
