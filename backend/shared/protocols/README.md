# Shared Protocols (Protobuf) — Interview Prep & Tricky Points

Protocol Buffer definitions for inter-service communication via gRPC.

---

## Protocol Buffers — Interview Questions

**Q: Why Protocol Buffers over JSON for inter-service communication?**
A: (1) **Typed** — schema is required, no silent string/number mismatches. (2) **Smaller** — binary encoding is ~10× smaller than JSON. (3) **Faster** — serialization/deserialization is ~100× faster. (4) **Backward compatible** — field numbers never change, adding fields doesn't break old consumers.

**Q: How do you version protobuf messages?**
A: Field numbers are permanent — never reuse a deleted field number. Use `reserved` to mark deleted fields. Add new fields with new numbers — old consumers ignore unknown fields. Breaking changes: renaming a field (number stays same, safe), changing a field type (unsafe, create new field).

**Q: gRPC vs REST — when to use which?**
A: gRPC for internal service-to-service: typed contracts, streaming (server/client/bidirectional), low latency, high throughput. REST for external/public APIs: browser support, HTTP/1.1 compatibility, simpler debugging (curl). Persona uses both: gRPC internally, REST at the API gateway.

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Field numbers 1-15 vs 16+** | Numbers 1-15 use 1 byte in the wire format. 16+ use 2+ bytes. | Use 1-15 for frequently occurring fields |
| **Missing required fields** | Proto3 removed `required` — all fields are optional by default | Validate required fields in application code, or use `google.api.field_behavior` annotation |
| **Enum wire compatibility** | Adding an enum value can break old consumers | New enum values get default (0) on old clients. Use `allow_alias = true` for safe additions. |
| **Large messages** | gRPC has a 4MB default message size limit | Increase limit in the server config, or paginate large responses |
| **gRPC-web limitations** | Browsers can't send HTTP/2 trailers. gRPC-web requires a proxy (Envoy) or grpc-web client | Use Envoy as a sidecar for gRPC-web, or use Connect-Web |
| **Oneof limitations** | Only one field in a `oneof` can be set. Setting another clears the first | Document which `oneof` variants are expected in each context |

## gRPC — Interview Questions

**Q: How does gRPC handle connection management?**
A: gRPC uses HTTP/2 multiplexing — multiple streams over a single TCP connection. Connections are long-lived and shared. The client manages connection pooling (keep-alive pings, reconnection on failure). Each service should configure `grpc.keepalive_time` and `grpc.keepalive_timeout`.

**Q: How do you add authentication to gRPC?**
A: Use interceptors/middleware. For service-to-service: mTLS (mutual TLS with client certificates). For user-facing: pass JWT in gRPC metadata (similar to HTTP headers). The server interceptor extracts and validates the token before the request reaches the handler.

**Q: What are gRPC streams vs unary calls?**
A: Unary: client sends one request, server returns one response (like REST). Server streaming: client sends one request, server streams multiple responses (like a feed). Client streaming: client streams multiple requests, server returns one response (like a file upload). Bidirectional streaming: both sides stream independently (like a chat).

## Build & Generate Code

```bash
protoc --go_out=. --go-grpc_out=. *.proto
```

This generates Go server/client stubs. For other languages, use the appropriate plugin:
```bash
protoc --python_out=. --grpc_python_out=. *.proto
protoc --java_out=. --grpc_java_out=. *.proto
```

Generated code should be checked into version control or generated at build time. CI must regenerate and verify no drift.
