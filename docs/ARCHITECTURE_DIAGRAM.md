# Persona Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER (Phase 2)                         │
├──────────────────────────┬──────────────────────┬───────────────────────────┤
│   Web React App          │  Mobile App          │  Admin Dashboard          │
│   (8000)                 │  (React Native)      │  (8100)                   │
└────────────┬─────────────┴──────────┬───────────┴────────────┬──────────────┘
             │                        │                        │
             └────────────────────────┼────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                        │
│                    (Request Routing, Auth, Rate Limiting)                  │
└────────────┬────────────────┬────────────────┬────────────────┬────────────┘
             │                │                │                │
    ┌────────▼────────┐  ┌─────▼──────┐  ┌──────▼─────┐  ┌─────▼────────────┐
    │  USER SERVICE   │  │   CONTENT  │  │   MEDIA    │  │  ANALYTICS       │
    │    (Python)     │  │  SERVICE   │  │  SERVICE   │  │  SERVICE         │
    │   Port 8001     │  │   (Go)     │  │ (Node.js)  │  │  (Java)          │
    │                 │  │ Port 8002  │  │ Port 8003  │  │  Port 8004       │
    │ • Register      │  │            │  │            │  │                  │
    │ • Login         │  │ • Posts    │  │ • Uploads  │  │ • Events         │
    │ • Profiles      │  │ • Letters  │  │ • Streams  │  │ • Analytics      │
    │ • Interests     │  │ • Search   │  │ • Process  │  │ • Reports        │
    └────────┬────────┘  └─────┬──────┘  └──────┬─────┘  └─────┬────────────┘
             │                │                │                │
             │        ┌────────▼──────┐        │                │
             │        │ SIMULATION    │        │                │
             │        │ SERVICE       │        │                │
             │        │ (Rust)        │        │                │
             │        │ Port 8005     │        │                │
             │        │               │        │                │
             │        │ • Simulations │        │                │
             │        │ • Computing   │        │                │
             │        └────────┬──────┘        │                │
             │                 │                │                │
┌────────────▼─────────────────▼────────────────▼────────────────▼─────────────┐
│                    INTER-SERVICE COMMUNICATION LAYER                         │
│              (gRPC for services, REST for external clients)                  │
│         • Message Queue (Kafka/RabbitMQ) for async events                    │
│         • Service Discovery & Load Balancing                                 │
└────────────┬──────────────────────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                           │
├──────────────────┬──────────────┬──────────────┬─────────────┬───────────────┤
│   PostgreSQL     │    Redis     │   MongoDB    │ Elasticsearch│  S3/Cloud     │
│   (Primary DB)   │    (Cache)   │  (Documents) │  (Search)   │  Storage      │
│                  │              │              │             │               │
│ • Users          │ • Sessions   │ • User       │ • Indexed   │ • Media       │
│ • Posts          │ • Tokens     │   Content    │   Posts     │   Files       │
│ • Analytics      │ • Counters   │ • Media      │ • Analytics │ • Backups     │
│ • Metadata       │ • Locks      │   Metadata   │             │               │
└──────────────────┴──────────────┴──────────────┴─────────────┴───────────────┘
             │
┌────────────▼──────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                                      │
├──────────────────┬──────────────┬──────────────┬──────────────┬───────────────┤
│   Docker         │  Kubernetes  │   CI/CD      │  Monitoring  │  Logging      │
│                  │              │  (GitHub     │  (Prometheus)│  (ELK Stack)  │
│ • Containers     │ • Pods       │   Actions)   │  (Grafana)   │               │
│ • Images         │ • Services   │              │              │ • Centralized │
│ • Volumes        │ • Ingress    │ • Tests      │ • Metrics    │   Logs        │
│                  │ • StatefulSet│ • Build      │ • Alerts     │ • Tracing     │
└──────────────────┴──────────────┴──────────────┴──────────────┴───────────────┘
```

## Service Dependencies

```
User Service
    ├── PostgreSQL
    ├── Redis
    └── JWT Auth

Content Service
    ├── PostgreSQL
    ├── Elasticsearch
    └── gRPC → User Service

Media Service
    ├── PostgreSQL
    ├── S3/Cloud Storage
    └── gRPC → User Service

Analytics Service
    ├── PostgreSQL
    ├── Elasticsearch
    ├── Kafka/RabbitMQ
    └── gRPC → All Services

Simulation Service
    ├── PostgreSQL
    ├── Redis
    └── gRPC → All Services
```

## Data Flow

```
User Registration
User → API Gateway → User Service → PostgreSQL + Redis

Create Post
User → API Gateway → Content Service
                     → PostgreSQL
                     → Elasticsearch
                     → Analytics Service (async event)

Upload Media
User → API Gateway → Media Service
                     → PostgreSQL
                     → S3/Cloud Storage
                     → Content Service (link to post)
                     → Analytics Service (async event)

Analytics
Events → Analytics Service
         → Elasticsearch
         → Reports & Dashboards
```

## Communication Protocols

```
External ↔ API Gateway: REST + JSON
         ↔ Frontend: REST + WebSockets

Services ↔ Services: gRPC + Protocol Buffers
Services ↔ Queue: Kafka/RabbitMQ Messages
Services → Cache: Redis Protocol
Services → Database: SQL / MongoDB Query Language
```

## Deployment Environments

```
Development → Docker Compose (localhost)
Staging → Kubernetes (staging cluster)
Production → Kubernetes (production cluster) + CDN
```

## Load Distribution

```
Request → Load Balancer
         → API Gateway (N replicas)
         → Service (N replicas)
         → Database (Read replicas)
         → Cache (Distributed Redis)
```

This architecture ensures scalability, fault tolerance, and independent deployment of services.
