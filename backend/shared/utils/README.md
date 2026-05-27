# Shared Utilities — Interview Prep & Tricky Points

Common utilities, helpers, and libraries used across all Persona services. Each service imports what it needs.

---

## Modules

| Module | Purpose | Key Interview Point |
|--------|---------|-------------------|
| **Auth** | JWT validation, token generation | Algorithm agnostic, key rotation, expiry handling |
| **Logging** | Centralized structured logging | Correlation IDs, log levels, structured vs unstructured |
| **Errors** | Common error types and handling | Error wrapping, stack traces, user-facing vs internal |
| **Database** | Connection pooling, helpers | Pool exhaustion, retry logic, transaction management |
| **Testing** | Test utilities, mocks | Table-driven tests, interface mocking, golden files |
| **Middleware** | CORS, auth, logging, rate limiting | Order matters, panic recovery, request scoping |

---

## Auth — Interview Questions

**Q: JWT vs opaque tokens — which is better?**
A: JWTs are self-contained (payload + signature) — no DB lookup needed for validation. Opaque tokens require a server-side store. JWTs can't be revoked before expiry (unless you maintain a blocklist). For session tokens, use opaque tokens stored in Redis. For API access tokens, use JWTs with short expiry.

**Q: How do you handle JWT key rotation?**
A: Include a `kid` (key ID) in the JWT header. The auth service publishes current and previous public keys. The validation middleware fetches the key by `kid`, verifies the signature. Before rotating, keep the old key for the token's remaining lifetime (grace period).

**Q: What should a JWT contain?**
A: Minimum: `sub` (user ID), `iat` (issued at), `exp` (expiry). Optional: `roles`, `permissions`, `email`. Never store sensitive data (password hash, SSN) — JWT payload is base64-encoded, not encrypted.

---

## Logging — Interview Questions

**Q: Structured vs unstructured logging?**
A: Unstructured: `"User 123 logged in at 12:00"` — hard to search, parse, aggregate. Structured: `{"event": "user_login", "user_id": "123", "timestamp": "12:00:00"}` — queryable in ELK/Loki, filterable, analyzable. Always use structured logging with a consistent schema.

**Q: What is a correlation ID?**
A: A unique ID generated at the API gateway and propagated through all downstream services via HTTP headers/gRPC metadata. It links all logs and traces for a single request across services. Without it, debugging a cross-service failure requires matching timestamps manually.

---

## Database — Interview Questions

**Q: Why connection pooling?**
A: Creating a database connection is expensive (TCP handshake, auth, SSL negotiation). A pool keeps N connections alive and reuses them. Set `pool_size` per service based on expected concurrency. Too small → request queuing. Too large → database overload.

**Q: How do you handle connection pool exhaustion?**
A: Symptoms: requests hang, timeout errors. Causes: connections not returned to pool (missing `.close()` in error paths), pool too small, a slow query holding connections for minutes. Fix: add connection timeouts, query timeouts, and always close in `finally` blocks.

---

## Middleware — Interview Questions

**Q: Why does middleware order matter?**
A: Middleware executes in the order it's registered. Typical order: (1) Panic recovery (catch crashes), (2) Request logging (capture timing), (3) CORS (allow cross-origin), (4) Auth (validate token), (5) Rate limiting (protect downstream), (6) Business logic. If CORS runs after auth, preflight OPTIONS requests fail auth.

**Q: How do you implement rate limiting?**
A: Token bucket or sliding window. Store counters in Redis per user/IP. `INCR key` → if count > limit, return 429. Set TTL = window size. For distributed rate limiting, use Redis cluster or a centralized rate limiter service.
