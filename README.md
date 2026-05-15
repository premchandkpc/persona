# Persona - Multi-Domain, Multi-Service Platform

**Persona** is a large-scale, production-ready platform capturing user interests across multiple content types: **videos**, **audios**, **simulations**, **letters**, **posts**, and **Instagram content**.

## 🎯 Vision

Build a comprehensive platform that understands and serves user interests across diverse media and content types, with a scalable, microservices-based architecture supporting multiple programming languages.

## 📋 What's Included

### Internal Services (Phase 1 - In Progress)
- **User Service** (Python) - User management & authentication
- **Content Service** (Go) - Posts, letters, content management
- **Media Service** (Node.js) - Video & audio handling
- **Analytics Service** (Java) - User behavior tracking
- **Simulation Service** (Rust) - Heavy computation & simulations
- **API Gateway** - Request routing & authentication
- **Databases** - PostgreSQL, Redis, MongoDB, Elasticsearch
- **Infrastructure** - Docker, Kubernetes, CI/CD ready

### Frontend (Phase 2 - Coming Later)
- **Web App** - React dashboard
- **Mobile App** - React Native for iOS/Android

## 🏗️ Project Structure

```
persona/
├── backend/services/
│   ├── user-service-python/           # User management
│   ├── content-service-go/             # Content management
│   ├── media-service-nodejs/           # Media handling
│   ├── analytics-service-java/         # Analytics
│   └── simulation-service-rust/        # Simulations
├── backend/shared/                     # Shared utilities & protocols
├── frontend/
│   ├── web-react/                      # (Coming soon)
│   └── mobile-react-native/            # (Coming soon)
├── infrastructure/
│   ├── kubernetes/                     # K8s manifests
│   └── docker/                         # Dockerfiles
├── databases/
│   ├── schemas/                        # DB schemas
│   └── migrations/                     # Migration scripts
└── docs/                               # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Kubernetes (kubectl)
- Node.js, Python, Go, Java, Rust (for local development)

### Start All Services
```bash
docker-compose up -d
```

### Verify Services Running
```bash
curl http://localhost:8001/health  # User Service
curl http://localhost:8002/health  # Content Service
curl http://localhost:8003/health  # Media Service
curl http://localhost:8004/health  # Analytics Service
curl http://localhost:8005/health  # Simulation Service
```

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & service overview
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** - Development phases & timeline
- **[DOMAINS.md](DOMAINS.md)** - Domain models & data relationships
- **[DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md)** - Local development guide

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| User Service | Python + FastAPI |
| Content Service | Go |
| Media Service | Node.js + Express |
| Analytics Service | Java + Spring Boot |
| Simulation Service | Rust |
| Web Frontend | React (Phase 2) |
| Mobile Frontend | React Native (Phase 2) |
| Primary DB | PostgreSQL |
| Cache | Redis |
| Document DB | MongoDB |
| Search | Elasticsearch |
| Container | Docker |
| Orchestration | Kubernetes |
| Message Queue | Kafka/RabbitMQ |
| API Gateway | Kong/Nginx |

## 📊 User Interest Domains

Persona tracks user interests across:
1. **Videos** - Watch history, preferences, recommendations
2. **Audios** - Listening history, playlists, favorites
3. **Simulations** - Simulation history, results, performance
4. **Letters** - Writing & reading history, saved letters
5. **Posts** - Publishing activity, social engagement
6. **Instagram Content** - Linked accounts, saved posts, engagement

## 🔄 Service Communication

- **Inter-Service**: gRPC + Protocol Buffers
- **External API**: REST + JSON
- **Async Events**: Message Queue (Kafka/RabbitMQ)
- **Real-time**: WebSockets (Phase 2)

## 📈 Deployment Strategy

### Local Development
```bash
docker-compose up
```

### Kubernetes (Production-Ready)
```bash
kubectl apply -f infrastructure/kubernetes/
```

### CI/CD
- GitHub Actions / GitLab CI
- Automated testing on each commit
- Rolling deployments
- Automatic rollback on failure

## 🎯 Development Phases

### Phase 1: Internal Services (Weeks 1-8)
- ✅ Project structure
- ⏳ Service implementation
- ⏳ Database schemas
- ⏳ API integration
- ⏳ Testing & deployment

### Phase 2: Frontend (Weeks 9-14)
- ⏳ Web React app
- ⏳ Mobile React Native app
- ⏳ UI/UX polish
- ⏳ Production deployment

### Phase 3: Advanced Features (Ongoing)
- Social interactions
- Real-time notifications
- Recommendations engine
- Advanced analytics

## 🔐 Security Considerations

- JWT-based authentication
- Service-to-service authentication (mTLS)
- Encrypted database connections
- Rate limiting & DDoS protection
- Input validation & sanitization
- Regular security audits

## 📊 Monitoring & Observability

- **Logging**: Centralized logging (ELK/Loki)
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger/Zipkin
- **Alerts**: PagerDuty/Slack integration
- **Dashboards**: Real-time health monitoring

## 🛠️ Contributing

### Setup for Development
```bash
git clone <repo>
cd persona
# See DEVELOPMENT_SETUP.md for full instructions
```

### Running Tests
```bash
# Each service has its own test suite
cd backend/services/<service-name>
# Run test command (varies by language)
```

### Code Standards
- Follow language-specific conventions
- 80% test coverage minimum
- Code review required before merge
- Automated linting & formatting

## 📞 Support & Questions

- Check [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for common issues
- Review service-specific READMEs in each `backend/services/` folder
- Check API documentation in `docs/`

## 📄 License

MIT License - See LICENSE file for details

---

## 🌟 Key Features

✨ **Microservices Architecture** - Independent, scalable services
🔄 **Polyglot Stack** - Best language for each domain
🚀 **Cloud-Ready** - Docker & Kubernetes native
📦 **Modular** - Easy to add new services
🧪 **Test-Driven** - Comprehensive testing
📊 **Observable** - Full monitoring & logging
🔐 **Secure** - Enterprise-grade security
📈 **Scalable** - Horizontal scaling built-in

---

**Status**: 🚧 Phase 1 In Progress - Building Internal Services

**Next**: See [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for detailed timeline
