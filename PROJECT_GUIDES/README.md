# Persona Platform - Project Guides Index

**Complete documentation for all projects in the Persona platform**

All guides include: what it does, why that tech, detailed architecture, step-by-step examples, how to run, and next steps.

---

## Projects Overview

### 1. **Micrograd** - AI/ML Learning (Beginner-Intermediate)
**File**: [01_MICROGRAD_COMPLETE.md](01_MICROGRAD_COMPLETE.md)

**What**: Andrej Karpathy's automatic differentiation engine (educational AI)
**Language**: Python
**Time**: 2-3 hours
**Key Concepts**: Backpropagation, computation graphs, neural networks, gradient descent

**Start Here If**: You want to understand how neural networks learn from scratch

**Quick Start**:
```bash
cd /persona/ai-ml
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
jupyter notebook micrograd.ipynb
```

---

### 2. **User Service** - Authentication & User Management (Beginner-Intermediate)
**File**: [02_USER_SERVICE_PYTHON.md](02_USER_SERVICE_PYTHON.md)

**What**: Handles user registration, login, profiles, interests, relationships
**Language**: Python + FastAPI
**Time**: 2-3 hours
**Port**: 8001
**Key Concepts**: JWT authentication, FastAPI, PostgreSQL, Redis caching, microservices

**Start Here If**: You want to understand authentication, user management, microservice basics

**Quick Start**:
```bash
cd /persona/backend/services/user-service-python
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
fastapi run src/main.py
# Visit: http://localhost:8001/docs
```

---

### 3. **Content Service** - Post Management & Search (Intermediate)
**File**: [03_CONTENT_SERVICE_GO.md](03_CONTENT_SERVICE_GO.md)

**What**: Posts, letters, comments, hashtags, search, feed generation
**Language**: Go + Gin framework
**Time**: 3-4 hours
**Port**: 8002
**Key Concepts**: Goroutines, Concurrency, Elasticsearch, Feed systems, High-throughput APIs

**Start Here If**: You want to understand Go concurrency, feed systems, high-performance APIs

**Quick Start**:
```bash
cd /persona/backend/services/content-service-go
go mod download
go run cmd/main.go
# Visit: http://localhost:8002/swagger
```

---

### 4. **Media Service** - Video/Audio Processing (Intermediate-Advanced)
**File**: [04_MEDIA_SERVICE_NODEJS.md](04_MEDIA_SERVICE_NODEJS.md)

**What**: File upload, FFmpeg transcoding, quality variants, streaming, CDN integration
**Language**: Node.js + Express/NestJS
**Time**: 3-4 hours
**Port**: 8003
**Key Concepts**: Async/await, Streaming, Bull job queue, FFmpeg, S3 storage

**Start Here If**: You want to understand file processing, async operations, background jobs

**Quick Start**:
```bash
cd /persona/backend/services/media-service-nodejs
npm install
npm run dev
# Visit: http://localhost:8003/docs
```

---

### 5. **Analytics Service** - Event Processing & Reporting (Intermediate-Advanced)
**File**: [05_ANALYTICS_SERVICE_JAVA.md](05_ANALYTICS_SERVICE_JAVA.md)

**What**: Event ingestion, user behavior tracking, aggregation, reporting, dashboards
**Language**: Java + Spring Boot
**Time**: 4-5 hours
**Port**: 8004
**Key Concepts**: Kafka streams, Spring Boot, Event sourcing, CQRS, Enterprise patterns

**Start Here If**: You want to understand Kafka, event processing, analytics, Java enterprise apps

**Quick Start**:
```bash
cd /persona/backend/services/analytics-service-java
mvn clean install
mvn spring-boot:run
# Visit: http://localhost:8004/swagger-ui.html
```

---

### 6. **Simulation Service** - Heavy Computation (Advanced)
**File**: [06_SIMULATION_SERVICE_RUST.md](06_SIMULATION_SERVICE_RUST.md)

**What**: Simulations, optimization algorithms, ML inference, heavy math
**Language**: Rust + Actix-web
**Time**: 4-5 hours
**Port**: 8005
**Key Concepts**: Memory safety, Ownership, Rayon parallelism, Zero-cost abstractions, Performance

**Start Here If**: You want to understand Rust, performance optimization, computational physics

**Quick Start**:
```bash
cd /persona/backend/services/simulation-service-rust
cargo build --release
cargo run --release
# Visit: http://localhost:8005/api/docs
```

---

### 7. **Platform Integration** - How It All Works Together (Advanced)
**File**: [07_PLATFORM_INTEGRATION.md](07_PLATFORM_INTEGRATION.md)

**What**: System architecture, service communication, data flow, infrastructure, deployment
**Scope**: Entire platform
**Time**: 2-3 hours
**Key Concepts**: Microservices, Event-driven architecture, Kubernetes, Monitoring

**Start Here If**: You want to understand the whole system, deployments, how services communicate

**Quick Start** (Docker Compose):
```bash
cd /persona
docker-compose up
# User Service:      http://localhost:8001/docs
# Content Service:   http://localhost:8002/swagger
# Media Service:     http://localhost:8003/docs
# Analytics Service: http://localhost:8004/swagger-ui.html
# Simulation Service: http://localhost:8005/api/docs
```

---

## Learning Paths

### Path 1: Frontend Developer
Want to build UIs that interact with these services?

1. Start: **User Service** (02) - understand authentication
2. Then: **Platform Integration** (07) - see system overview
3. Practice: Make API calls to each service from postman/code
4. Build: Frontend that calls all services

Time: 4-5 hours

### Path 2: Backend Developer
Want to build microservices?

1. Start: **User Service** (02) - basic Python service
2. Then: **Content Service** (03) - Go concurrency
3. Then: **Media Service** (04) - Node.js async/streams
4. Then: **Analytics Service** (05) - Java enterprise
5. Then: **Simulation Service** (06) - Rust performance
6. Finally: **Platform Integration** (07) - orchestration

Time: 15-20 hours (complete journey)

### Path 3: Full Stack (Everything)
Want to understand the entire system?

1. **Micrograd** (01) - Understand AI/ML concepts
2. **User Service** (02) - Learn microservice basics
3. **Content Service** (03) - Understand concurrency
4. **Media Service** (04) - Learn file processing
5. **Analytics Service** (05) - Event-driven systems
6. **Simulation Service** (06) - Performance & safety
7. **Platform Integration** (07) - See it all together

Time: 20-25 hours

### Path 4: DevOps/Infrastructure
Want to deploy and manage these services?

1. Start: **Platform Integration** (07) - architecture overview
2. Focus: Docker Compose, Kubernetes, monitoring sections
3. Practice: Deploy services locally and to cloud
4. Advanced: Set up CI/CD, monitoring, alerts

Time: 5-8 hours

---

## Common Questions

### "Which service should I start with?"
- **Easiest**: User Service (Python, FastAPI)
- **Most interesting**: Media Service (FFmpeg) or Simulation Service (Rust)
- **Most practical**: Content Service (Go concurrency patterns)
- **Most educational**: Micrograd (AI/ML fundamentals)

### "Can I run all services locally?"
Yes! Use Docker Compose:
```bash
cd /persona
docker-compose up
```
All services + infrastructure runs on your machine.

### "How do I understand the code?"
Each guide has:
- Architecture diagrams
- Code walkthroughs
- Step-by-step examples
- API endpoint examples
- Troubleshooting

Start with the "Examples" section of each guide.

### "What's the order to build?"
If building from scratch:
1. User Service (auth foundation)
2. Content Service (core features)
3. Media Service (file handling)
4. Analytics Service (tracking)
5. Simulation Service (advanced features)

### "How do I test my changes?"
Each service has:
- Unit tests: `pytest`, `go test`, `jest`, `mvn test`, `cargo test`
- Integration tests: Tests with actual databases
- End-to-end tests: Full system flows

See "How to Run" → "Run Tests" in each guide.

---

## Tech Stack Summary

| Layer | Technology | Guide |
|-------|-----------|-------|
| **AI/ML** | Python + Micrograd | 01 |
| **Auth** | Python + FastAPI | 02 |
| **Content** | Go + Gin | 03 |
| **Media** | Node.js + Express | 04 |
| **Analytics** | Java + Spring Boot | 05 |
| **Simulation** | Rust + Actix-web | 06 |
| **Database** | PostgreSQL, Redis, MongoDB | 07 |
| **Search** | Elasticsearch | 07 |
| **Queue** | Kafka, RabbitMQ, Bull | 07 |
| **Storage** | S3, Google Cloud Storage | 04 |
| **Container** | Docker, Docker Compose | 07 |
| **Orchestration** | Kubernetes | 07 |
| **Monitoring** | Prometheus, Grafana | 07 |
| **Logging** | ELK Stack | 07 |
| **Tracing** | Jaeger | 07 |

---

## Directory Structure

```
persona/
├── PROJECT_GUIDES/              ← You are here
│   ├── README.md                (this file)
│   ├── 01_MICROGRAD_COMPLETE.md
│   ├── 02_USER_SERVICE_PYTHON.md
│   ├── 03_CONTENT_SERVICE_GO.md
│   ├── 04_MEDIA_SERVICE_NODEJS.md
│   ├── 05_ANALYTICS_SERVICE_JAVA.md
│   ├── 06_SIMULATION_SERVICE_RUST.md
│   └── 07_PLATFORM_INTEGRATION.md
│
├── ai-ml/                       → Micrograd project (guide #1)
│   ├── micrograd.ipynb
│   ├── micrograd.py
│   └── MICROGRAD.md
│
├── backend/services/
│   ├── user-service-python/     → User Service (guide #2)
│   ├── content-service-go/      → Content Service (guide #3)
│   ├── media-service-nodejs/    → Media Service (guide #4)
│   ├── analytics-service-java/  → Analytics Service (guide #5)
│   └── simulation-service-rust/ → Simulation Service (guide #6)
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── ...                      → Infrastructure setup (guide #7)
│
├── databases/
│   ├── schemas/
│   └── migrations/
│
├── docker-compose.yml           → Local development
└── README.md                    → Project overview
```

---

## Key Files in Each Service

### User Service
- `src/main.py` - FastAPI application
- `src/api/routes/auth.py` - Login/register endpoints
- `src/models/user.py` - User database model
- `requirements.txt` - Dependencies

### Content Service
- `cmd/main.go` - Entry point
- `internal/handlers/posts.go` - Post endpoints
- `internal/services/feed_service.go` - Feed logic
- `go.mod` - Dependencies

### Media Service
- `src/main.ts` - NestJS application
- `src/controllers/upload.ts` - Upload handling
- `src/services/process.service.ts` - FFmpeg operations
- `package.json` - Dependencies

### Analytics Service
- `src/main/java/AnalyticsApplication.java` - Spring Boot app
- `src/main/java/service/EventService.java` - Event processing
- `pom.xml` - Dependencies

### Simulation Service
- `src/main.rs` - Entry point
- `src/api/handlers.rs` - HTTP handlers
- `src/service/simulation_service.rs` - Business logic
- `Cargo.toml` - Dependencies

---

## Running Everything

### Option 1: Docker Compose (Easiest for local development)
```bash
cd /persona
docker-compose up
# Starts: All 5 services + PostgreSQL + Redis + Elasticsearch + Kafka
# Services available at: localhost:8001-8005
# Health check all at once: curl http://localhost:8001/health
```

### Option 2: Run Each Service Individually
```bash
# Terminal 1
cd backend/services/user-service-python
fastapi run src/main.py

# Terminal 2
cd backend/services/content-service-go
go run cmd/main.go

# Terminal 3
cd backend/services/media-service-nodejs
npm run dev

# Terminal 4
cd backend/services/analytics-service-java
mvn spring-boot:run

# Terminal 5
cd backend/services/simulation-service-rust
cargo run --release
```

### Option 3: Kubernetes (Production)
```bash
# Create cluster
minikube start --cpus=4 --memory=8192

# Deploy
kubectl apply -f infrastructure/kubernetes/

# Monitor
kubectl dashboard

# Access
minikube service user-service  # Opens in browser
```

---

## Testing Workflows

### Quick Local Test
```bash
# Start services
docker-compose up

# Test user registration
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Test content creation (would need token from above)
curl -X POST http://localhost:8002/posts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello world!","hashtags":["hello"]}'

# Test search
curl "http://localhost:8002/posts/search?q=hello"
```

### Full Integration Test
```bash
# Run all tests
docker-compose exec user-service pytest tests/ -v
docker-compose exec content-service go test ./...
docker-compose exec media-service npm test
docker-compose exec analytics-service mvn test
docker-compose exec simulation-service cargo test
```

---

## Getting Help

### For Each Service
- Check the **Troubleshooting** section in that guide
- Run `docker-compose logs {service}` to see logs
- Check health endpoint: `curl http://localhost:{port}/health`

### For System-Wide Issues
- See **Troubleshooting** in Platform Integration guide
- Check Kubernetes status: `kubectl get pods`
- Check database: `docker-compose exec postgres psql -U postgres -l`

### For Understanding Concepts
- Each guide has a **Key Takeaways** section
- Check **Tech Stack** section for why each tool was chosen
- Review **Architecture** section for flow diagrams

---

## Next Steps

1. **Choose your path** (Frontend, Backend, Full Stack, DevOps)
2. **Start with the first guide** in your path
3. **Run the service locally** (`docker-compose up`)
4. **Try the examples** (Postman, curl, or code)
5. **Modify something** and see what breaks (learning!)
6. **Move to next guide** when comfortable

**Total time investment**:
- Quick overview (guides 2+7): 4-5 hours
- One service deep dive (guide 2-6): 3-4 hours
- Complete understanding (all 7): 20-25 hours

---

## Architecture at a Glance

```
Frontend (Web/Mobile)
    ↓
API Gateway (Kong/Nginx)
    ↓
┌─────────────────────────────────────────────────┐
│ Microservices Layer                              │
│                                                   │
│  User Service (auth) ←─┐                        │
│  Content Service (posts) ├─→ PostgreSQL        │
│  Media Service (files)   │                       │
│  Analytics Service       │                       │
│  Simulation Service      └─→ Redis             │
│                                 ↓                │
│  [Event Bus: Kafka/RabbitMQ]   Elasticsearch   │
│       ↓                         S3              │
│  Real-time processing    Other Databases        │
└─────────────────────────────────────────────────┘
    ↓
Data Layer (PostgreSQL, Redis, Elasticsearch, S3)
```

---

## Files You'll Need to Read

**Essential**:
- Each service's README.md
- `ARCHITECTURE.md` (project root)
- `docker-compose.yml` (infrastructure)
- `.env.example` (configuration)

**Optional**:
- `DEVELOPMENT_SETUP.md` (detailed local setup)
- `PROJECT_ROADMAP.md` (timeline)
- Service-specific docs in `docs/` folder

---

## Credits

These guides cover:
- **Micrograd**: Andrej Karpathy's educational implementation
- **User Service**: FastAPI + PostgreSQL patterns
- **Content Service**: Go concurrency patterns
- **Media Service**: Node.js streaming + FFmpeg integration
- **Analytics Service**: Spring Boot + Kafka patterns
- **Simulation Service**: Rust performance + safety patterns
- **Platform**: Microservices best practices

All designed to teach real-world architecture.

---

## License

Educational use. Learn, build, adapt!

---

**Start exploring**: Pick a guide, run the service, have fun! 🚀
