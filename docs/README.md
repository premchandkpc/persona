# Documentation — Interview Prep & Tricky Points

Project documentation and guides for the Persona platform.

---

## Technical Documentation — Interview Questions

**Q: What makes good API documentation?**
A: Clear endpoint descriptions, request/response schemas, authentication requirements, error codes, rate limits, and runnable examples (cURL, Python, JS). OpenAPI/Swagger auto-generates interactive docs — but schema descriptions must be written by humans. Example: FastAPI auto-generates Swagger UI from Python type hints.

**Q: How do you keep documentation in sync with code?**
A: **Doc-as-code**: OpenAPI specs in YAML are version-controlled. CI validates PRs don't break the spec. Auto-generated docs (Swagger UI, typedoc, JSDoc) are rebuilt on each deploy. Documentation that's not in version control is documentation that will go stale.

**Q: What should a deployment guide cover?**
A: Prerequisites (tools, accounts, permissions), environment setup (env vars, secrets), step-by-step deploy commands, verification steps (health check endpoints), rollback procedure, and common failure modes.

## Common Pitfalls

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Outdated FAE** | The FAQ answers a question that no longer applies | Treat FAQ like code — review and update in every sprint |
| **No onboarding guide** | New developers spend days figuring out how to run the project locally | Write a `DEVELOPMENT_SETUP.md` with exact commands for local setup |
| **Missing error codes** | API returns `{"error": "something went wrong"}` with no code or resolution | Document every error code, its meaning, and how to fix it |
| **No runbook** | When pager duty alerts, engineers don't know what to check | Create runbooks for common incidents: symptom → diagnosis → fix commands |

## Key Concepts

- **OpenAPI/Swagger**: Industry standard for REST API documentation. Use `openapi-generator` to generate client SDKs.
- **AsyncAPI**: The OpenAPI equivalent for event-driven/async APIs (Kafka, RabbitMQ). Documents publish/subscribe contracts.
- **ADRs (Architecture Decision Records)**: Short documents capturing architectural decisions, their context, and consequences. Each ADR answers "why did we do it this way?"
- **Postman Collections**: Shareable, runnable API request collections. Can be exported to OpenAPI and vice versa. Great for manual testing and demos.

## Interview Questions

**Q: How do you document a microservice architecture?**
A: (1) **System context diagram** — shows services and their relationships. (2) **Service-level docs** — each service README covers its domain, APIs, dependencies, and configuration. (3) **Sequence diagrams** — show data flow for key operations (user registration, content creation). (4) **Decision records** — why each technology was chosen.

**Q: Documentation vs code comments — what goes where?**
A: Code comments explain **why** (non-obvious decisions, workarounds, edge cases). Documentation explains **how** (APIs, architecture, setup, workflows). If you need a comment to explain **what** the code does, refactor the code to be self-documenting.
