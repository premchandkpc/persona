# Docker — Interview Prep & Tricky Points

Dockerfiles for each Persona service. All use multi-stage builds to minimize image size.

---

## Multi-Stage Builds — Interview Questions

**Q: Why multi-stage builds?**
A: Each stage can use a different base image. The first stage (build) includes compilers, SDKs, dependencies. The second stage (runtime) copies only the compiled artifact and runtime deps. This dramatically reduces image size: e.g., Rust: 1.5GB build → 50MB runtime. Go: 1.2GB build → 15MB runtime.

**Q: Why is image size important?**
A: Smaller images: faster pull times (seconds vs minutes), less disk usage on nodes, fewer vulnerabilities (less surface area), faster cold starts in serverless environments.

## Language-Specific Optimizations

### Python
```dockerfile
FROM python:3.11-slim AS builder   # slim = no build tools
# Use --no-cache-dir to avoid caching pip downloads
# Use --user to avoid root-owned files in image
```
- Use `python:3.11-slim` (120MB) instead of `python:3.11` (900MB)
- Pin dependency versions for reproducible builds
- Copy only `requirements.txt` first to leverage Docker layer caching

### Go
```dockerfile
FROM golang:1.21-alpine AS builder  # alpine = 5MB base
# CGO_ENABLED=0 for static binary
# -ldflags="-s -w" to strip debug symbols
FROM scratch                         # literally empty = 15MB total
```
- Go compiles to a static binary — `FROM scratch` is the smallest possible image
- `CGO_ENABLED=0` prevents linking against C libraries (creates fully static binary)

### Java
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder
FROM eclipse-temurin:17-jre-alpine   # JRE only, not JDK
```
- Use `jre` (Java Runtime) not `jdk` (Java Dev Kit) in the final image
- Spring Boot fat JARs include embedded Tomcat — no need for external servlet container

### Node.js
```dockerfile
FROM node:20-alpine AS builder
RUN npm ci --only=production         # ci = exact versions from lockfile
FROM node:20-alpine
```
- `npm ci` (not `npm install`) ensures exact dependency versions
- `--only=production` skips devDependencies
- `.dockerignore` must include `node_modules` to avoid copying host node_modules

### Rust
```dockerfile
FROM rust:1.75-slim-bookworm AS builder
RUN cargo build --release
FROM debian:bookworm-slim            # debian, not rust
COPY --from=builder /app/target/release/app /app
```
- Rust needs the full compiler for build, but only glibc at runtime
- Use `--release` for optimized binary (vs debug with `cargo build`)

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Layer caching** | Docker caches each layer. Changing early layers (e.g., `apt-get update`) invalidates all subsequent layers | Order layers from least-changing to most-changing: OS packages → dependencies → code |
| **.dockerignore missing** | Sending the entire project context (including `node_modules`, `target/`) to the Docker daemon | Always include `.dockerignore` with `node_modules`, `target/`, `.git`, `__pycache__` |
| **Running as root** | Containers running as root are a security risk | Use `USER appuser` (create a non-root user in Dockerfile) |
| **Base image tagging** | `FROM python:latest` breaks when the tag updates | Pin to specific minor version: `python:3.11-slim` |
| **COPY vs ADD** | ADD has extra features (URL fetching, tar auto-extraction) that are rarely needed | Use COPY by default — it's more explicit |
| **Environment variables in CMD** | `CMD ["python", "app.py"]` doesn't source env vars. Shell form `CMD python app.py` does source them | Use exec form (`["..."]`) for reliability, set ENV explicitly |

## Key Interview Questions

**Q: What is the difference between CMD and ENTRYPOINT?**
A: CMD provides defaults that can be overridden (`docker run image <override>`). ENTRYPOINT configures the container to run as an executable — harder to override. Best practice: ENTRYPOINT for the command, CMD for default arguments.

**Q: How do you debug a container that immediately exits?**
A: Override the entrypoint: `docker run -it --entrypoint sh <image>`. This gives you a shell to inspect the filesystem, check environment variables, and run the app manually to see the error.

**Q: What is the difference between `docker build` layer caching and BuildKit?**
A: BuildKit (enabled via `DOCKER_BUILDKIT=1`) provides parallel builds, better cache invalidation, and support for `--mount=type=cache` (persists package manager caches across builds). It's the default in Docker 23.0+. Always use BuildKit for CI builds.
