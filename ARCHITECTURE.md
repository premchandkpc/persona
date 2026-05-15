# Persona - Project Architecture

## Overview
Persona is a large-scale, multi-domain, multi-service platform supporting multiple programming languages and frameworks.

## Project Structure

```
persona/
├── backend/                          # All internal services & APIs
│   ├── services/
│   │   ├── user-service-python/      # User management, profiles, interests
│   │   ├── content-service-go/       # Posts, letters, content management
│   │   ├── media-service-nodejs/     # Videos, audios, file uploads
│   │   ├── analytics-service-java/   # Analytics, tracking, reporting
│   │   └── simulation-service-rust/  # Simulations, heavy computation
│   └── shared/                       # Shared protocols, utils, libs
├── frontend/
│   ├── web-react/                    # Web dashboard (React)
│   └── mobile-react-native/          # Mobile app (React Native)
├── infrastructure/
│   ├── kubernetes/                   # K8s manifests
│   ├── docker/                       # Dockerfiles for each service
│   └── ci-cd/                        # CI/CD pipelines
├── databases/
│   ├── migrations/                   # Database migration scripts
│   └── schemas/                      # Database schemas
└── docs/                             # Project documentation

```

## Services Overview

### 1. User Service (Python)
- **Purpose**: User management, authentication, profiles, interests
- **Stack**: Python (FastAPI/Django)
- **Key Features**:
  - User registration & login
  - Profile management
  - Interest tracking (videos, audios, simulations, etc.)
  - Follow/connection system

### 2. Content Service (Go)
- **Purpose**: Content management (posts, letters, Instagram content)
- **Stack**: Go
- **Key Features**:
  - Create/read/update/delete posts
  - Letter management
  - Instagram content integration
  - Content discovery & search

### 3. Media Service (Node.js)
- **Purpose**: Video/audio processing and delivery
- **Stack**: Node.js (Express/Nest.js)
- **Key Features**:
  - Video upload & processing
  - Audio upload & processing
  - Streaming & delivery
  - Thumbnail generation

### 4. Analytics Service (Java)
- **Purpose**: User behavior tracking, analytics, insights
- **Stack**: Java (Spring Boot)
- **Key Features**:
  - Event tracking
  - User analytics
  - Reporting & dashboards
  - Data aggregation

### 5. Simulation Service (Rust)
- **Purpose**: Heavy computation, simulations
- **Stack**: Rust
- **Key Features**:
  - Complex simulations
  - High-performance processing
  - Real-time calculations
  - Optimization algorithms

## Communication Between Services
- **gRPC** for inter-service communication (protocols in `backend/shared/protocols/`)
- **REST APIs** for external clients
- **Message Queue** (RabbitMQ/Kafka) for async events

## Database Strategy
- PostgreSQL for relational data (users, content, posts)
- Redis for caching & sessions
- MongoDB/DynamoDB for user-generated content
- Elasticsearch for search & analytics

## Frontend Architecture
### Web (React)
- Component-based architecture
- State management (Redux/Context API)
- Pages for user dashboard, content feed, profile

### Mobile (React Native)
- Native mobile app for iOS/Android
- Shared code with web app where possible
- Optimized for mobile UX

## Deployment
- Docker containers for each service
- Kubernetes orchestration
- CI/CD pipelines (GitHub Actions/GitLab CI)
- Load balancing & auto-scaling

## Phase 1: Internal Services (Current)
1. ✓ Project structure setup
2. ⬜ User Service implementation
3. ⬜ Content Service implementation
4. ⬜ Media Service implementation
5. ⬜ Analytics Service implementation
6. ⬜ Simulation Service implementation
7. ⬜ API Gateway setup
8. ⬜ Database schema & migrations

## Phase 2: Frontend (Later)
9. ⬜ Web React app
10. ⬜ Mobile React Native app
11. ⬜ UI/UX integration

## Technology Stack Summary
| Component | Technology |
|-----------|-----------|
| User Service | Python (FastAPI) |
| Content Service | Go |
| Media Service | Node.js |
| Analytics Service | Java (Spring Boot) |
| Simulation Service | Rust |
| Web Frontend | React |
| Mobile Frontend | React Native |
| Databases | PostgreSQL, Redis, MongoDB |
| Messaging | Kafka/RabbitMQ |
| Container | Docker |
| Orchestration | Kubernetes |
| API Gateway | Kong/Nginx |

---
Start with Phase 1 (Internal Services) and add UI later.
