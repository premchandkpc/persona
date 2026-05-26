# Persona Platform - Complete Integration Guide

**What**: How all 5 microservices + infrastructure work together
**Difficulty**: Advanced
**Time**: 2-3 hours to understand
**Overview**: Platform architecture, communication, deployment

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Service Dependencies](#service-dependencies)
3. [Communication Patterns](#communication-patterns)
4. [Data Flow Examples](#data-flow-examples)
5. [Infrastructure](#infrastructure)
6. [Deployment](#deployment)
7. [Monitoring & Observability](#monitoring--observability)

---

## System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│         (Kong / Nginx / AWS API Gateway)                     │
│     Routes requests, rate limiting, auth, logging            │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
    │   User      │  │  Content    │  │   Media      │
    │  Service    │  │  Service    │  │  Service     │
    │  (Python)   │  │  (Go)       │  │  (Node.js)   │
    │ :8001       │  │ :8002       │  │ :8003        │
    └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
           │                │                │
        ┌──┴────────────────┴────────────────┴──┐
        │   Async Event Bus (Kafka/RabbitMQ)    │
        │  topics: user.*, post.*, media.*      │
        └──────────────────┬─────────────────────┘
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Analytics    │  │ Simulation   │  │ Search       │
    │ Service      │  │ Service      │  │ (Elasticsearch)
    │ (Java)       │  │ (Rust)       │  │              │
    │ :8004        │  │ :8005        │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
           │
        ┌──┴──────────────────────────────────────────┐
        │        Data Layer                          │
        │                                             │
        │  PostgreSQL (main DB)                       │
        │  Redis (cache, sessions)                    │
        │  MongoDB (flexible schemas)                 │
        │  Elasticsearch (search index)               │
        │  S3 (media storage)                         │
        └─────────────────────────────────────────────┘
```

### Service Responsibilities
```
┌─────────────────────────────────────────────────────────┐
│ User Service (Python)                                   │
├─────────────────────────────────────────────────────────┤
│ - User registration & login                             │
│ - Profile management                                    │
│ - JWT token generation & validation                     │
│ - Interest tracking                                     │
│ - User relationships (follow/unfollow)                  │
│ Depends On: PostgreSQL, Redis                           │
│ Used By: All other services                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Content Service (Go)                                    │
├─────────────────────────────────────────────────────────┤
│ - Post creation & management                            │
│ - Letter system (personal writing)                      │
│ - Comments & discussions                               │
│ - Hashtag management & trending                         │
│ - Content search & discovery                            │
│ Depends On: PostgreSQL, Elasticsearch, Redis, User Svc  │
│ Used By: Analytics, Frontend                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Media Service (Node.js)                                 │
├─────────────────────────────────────────────────────────┤
│ - Video/audio upload                                    │
│ - FFmpeg processing (transcode, compress)               │
│ - Quality variants (HQ, SD, mobile)                     │
│ - Thumbnail generation                                  │
│ - Streaming & CDN integration                           │
│ Depends On: PostgreSQL, Redis, S3, Bull queue           │
│ Used By: Content Service, Analytics                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Analytics Service (Java)                                │
├─────────────────────────────────────────────────────────┤
│ - Event ingestion & processing                          │
│ - User behavior analytics                               │
│ - Report generation                                     │
│ - Metrics & dashboards                                  │
│ Depends On: PostgreSQL, Redis, Kafka, Elasticsearch     │
│ Consumes: All events from Kafka                         │
│ Used By: Admin dashboard, reports                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Simulation Service (Rust)                               │
├─────────────────────────────────────────────────────────┤
│ - Heavy computational simulations                        │
│ - Physics, optimization, ML inference                    │
│ - Result caching                                         │
│ Depends On: PostgreSQL, Redis, Tokio, Rayon             │
│ Used By: Content Service, Frontend                      │
└─────────────────────────────────────────────────────────┘
```

---

## Service Dependencies

### Dependency Graph
```
User Service
    ↑
    │ (all services verify JWT)
    │
    ├← Content Service
    │   │
    │   ├← Analytics Service (consumes events)
    │   ├← Frontend
    │   └← Search (Elasticsearch)
    │
    ├← Media Service
    │   │
    │   ├← Storage (S3/GCS)
    │   ├← Processing (FFmpeg)
    │   └→ Analytics (publishes events)
    │
    └← Simulation Service
        │
        ├← Storage (PostgreSQL, Redis)
        └→ Analytics (publishes events)
```

### Direct Service-to-Service Calls
```
Sync (gRPC):
├─ Content Service calls User Service
│  └─ Fetch user info for post author
├─ Content Service calls Simulation Service
│  └─ Trigger simulation when requested
└─ Media Service calls User Service
   └─ Verify uploader credentials

Async (Event Bus):
├─ User Service publishes: user.created, user.interest.created
├─ Content Service publishes: post.created, comment.created
├─ Media Service publishes: media.uploaded, media.ready
└─ Simulation Service publishes: simulation.completed
    All consumed by: Analytics Service
```

---

## Communication Patterns

### Pattern 1: Synchronous (REST/gRPC)
**When**: Need immediate response
**Example**: Get user profile before displaying post
```
Client Request: GET /posts/789
    ↓
Content Service handler
    ├→ Query database: SELECT * FROM posts WHERE id=789
    └→ Fetch author: gRPC call to User Service
           └→ User Service: SELECT * FROM users WHERE id=123
           └→ Return: {id: 123, name: "Alice", ...}
    ├→ Combine results
    └→ Return: {post: {...}, author: {...}}
```

### Pattern 2: Asynchronous (Event Bus)
**When**: Fire-and-forget, don't need immediate response
**Example**: User watches video → Analytics should be notified
```
User watches video
    ↓
Media Service endpoint: GET /media/123/stream
    ├→ Serve video
    ├→ Publish event: "media.watched"
    │   (to Kafka topic: video.watched)
    └→ Return video immediately (don't wait)
    
[Meanwhile, Analytics Service]
    ├→ Consumes: video.watched
    ├→ Updates: user_analytics.videos_watched++
    ├→ Aggregates: trending videos
    └→ Publishes metrics to Prometheus
```

### Pattern 3: Request-Response via Event Bus
**When**: Need response, but service is slow
**Example**: Simulation takes 5-10 seconds
```
Client: POST /simulations
    ↓
Simulation Service
    ├→ Validate & create record
    ├→ Publish: "simulation.start_requested"
    └→ Return immediately: {id: "sim_123", status: "queued"}
    
[Meanwhile, Job Processor]
    ├→ Consumes: "simulation.start_requested"
    ├→ Runs: Physics simulation (5 seconds)
    ├→ Publishes: "simulation.completed" with results
    └→ Updates database
    
Client polls: GET /simulations/sim_123/results
    └→ Returns: {status: "completed", results: {...}}
```

---

## Data Flow Examples

### Example 1: User Registration Flow

```
1. Frontend POST /auth/register
   {email, password, name}
       ↓
2. User Service (port 8001)
   ├─ Validate email format
   ├─ Hash password (bcrypt)
   ├─ Check email not exists
   ├─ Insert into users table
   ├─ Generate JWT token
   ├─ Publish event: "user.created"
   └─ Return: {userId, token}
       ↓
3. Kafka receives: "user.created" event
       ├→ Analytics Service consumes
       │  └─ Increment counter: new_users_today
       │
       └→ Notification Service consumes
          └─ Send welcome email
       ↓
4. Frontend stores token
   (All future requests include token)
```

### Example 2: User Posts Video

```
1. Frontend: File upload to POST /media/upload
       ↓
2. Media Service (port 8003)
   ├─ Validate file (size, format, duration)
   ├─ Call User Service to verify uploader ✓
   ├─ Store original file in S3
   ├─ Create media record in database (status: processing)
   ├─ Add job to Bull queue
   ├─ Publish event: "media.uploaded"
   └─ Return: {jobId, status: "processing"}
       ↓
3. Content Service consumes "media.uploaded"
   └─ Updates post to include media_id
       ↓
4. Analytics Service consumes "media.uploaded"
   └─ Increments: user.media_count
       ↓
5. [Bull Queue Processor]
   ├─ Download from S3
   ├─ Run FFmpeg: transcode to HQ, SD, mobile
   ├─ Generate thumbnail
   ├─ Upload all to S3
   ├─ Update database: status = "ready"
   └─ Publish: "media.ready"
       ↓
6. Frontend polls GET /media/{jobId}/status
   └─ Returns: {status: "ready", qualities: [...]}
```

### Example 3: User Searches Posts

```
1. Frontend: GET /posts/search?q=golang&limit=10
       ↓
2. API Gateway routes to Content Service (port 8002)
       ↓
3. Content Service handler
   ├─ Check cache (Redis)
   │  ├→ Hit: return cached results
   │  └→ Miss: continue
   ├─ Call Elasticsearch
   │  └─ Query: {
   │       "query": {
   │         "multi_match": {
   │           "query": "golang",
   │           "fields": ["content", "hashtags"]
   │         }
   │       }
   │     }
   ├─ Elasticsearch returns: [{id: 123, score: 9.5}, ...]
   ├─ For each result:
   │  ├─ Fetch post details from PostgreSQL
   │  └─ Fetch author from User Service (parallel)
   ├─ Cache result for 1 hour
   └─ Return: {posts: [...], total: 342}
       ↓
4. Analytics Service consumes: "post.search"
   └─ Tracks: search queries, popular searches
```

---

## Infrastructure

### Docker Compose (Local Development)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - ./databases/schemas:/docker-entrypoint-initdb.d

  redis:
    image: redis:7
    ports: ["6379:6379"]

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports: ["9092:9092"]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    ports: ["2181:2181"]

  # Services
  user-service:
    build:
      context: ./backend/services/user-service-python
      dockerfile: Dockerfile
    ports: ["8001:8001"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/persona_users
      REDIS_URL: redis://redis:6379

  content-service:
    build:
      context: ./backend/services/content-service-go
      dockerfile: Dockerfile
    ports: ["8002:8002"]
    depends_on: [postgres, elasticsearch, redis, kafka]
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/persona_content
      ELASTICSEARCH_URL: http://elasticsearch:9200
      KAFKA_BROKERS: kafka:9092

  media-service:
    build:
      context: ./backend/services/media-service-nodejs
      dockerfile: Dockerfile
    ports: ["8003:8003"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/persona_media
      REDIS_URL: redis://redis:6379
      AWS_BUCKET: persona-media

  analytics-service:
    build:
      context: ./backend/services/analytics-service-java
      dockerfile: Dockerfile
    ports: ["8004:8004"]
    depends_on: [postgres, kafka]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/persona_analytics
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092

  simulation-service:
    build:
      context: ./backend/services/simulation-service-rust
      dockerfile: Dockerfile
    ports: ["8005:8005"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/persona_simulation
      REDIS_URL: redis://redis:6379

  api-gateway:
    image: kong:3.0
    ports: ["8000:8000"]
    depends_on: [postgres]
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
```

### Kubernetes (Production)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3  # 3 instances for HA
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: persona/user-service:1.0.0
        ports:
        - containerPort: 8001
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: postgres-url
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 8001
    targetPort: 8001
  type: ClusterIP  # Internal only

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Deployment

### Local (Docker Compose)
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f user-service

# Stop
docker-compose down
```

### Staging (Kubernetes Minikube)
```bash
# Create minikube cluster
minikube start --cpus=4 --memory=8192

# Apply all manifests
kubectl apply -f infrastructure/kubernetes/

# Check status
kubectl get pods
kubectl logs deployment/user-service

# Access service
minikube service user-service
```

### Production (AWS EKS)
```bash
# Create EKS cluster
eksctl create cluster \
  --name persona-prod \
  --region us-east-1 \
  --nodegroup-name persona-nodes \
  --nodes 5 \
  --node-type t3.large

# Deploy
kubectl apply -f infrastructure/kubernetes/

# Enable autoscaling
kubectl autoscale deployment user-service \
  --min=3 --max=10 \
  --cpu-percent=70

# Monitor
kubectl port-forward svc/prometheus 9090:9090
# Visit: http://localhost:9090 for metrics
```

---

## Monitoring & Observability

### Logging (ELK Stack)
```yaml
# All services ship logs to Elasticsearch
# Visualize in Kibana

# Example log event:
{
  "timestamp": "2026-01-20T10:30:45Z",
  "service": "user-service",
  "level": "INFO",
  "message": "User login successful",
  "user_id": 123,
  "duration_ms": 45,
  "trace_id": "abc123"
}

# Query in Kibana:
# service: "user-service" AND level: "ERROR"
# Shows all errors across all instances
```

### Metrics (Prometheus + Grafana)
```yaml
# Each service exposes metrics at /metrics
# Prometheus scrapes every 15 seconds

# Example metrics:
user_service_requests_total{method="POST", endpoint="/login"} 50234
user_service_request_duration_seconds{endpoint="/login"} 0.045
user_service_database_connections{} 8

# Grafana dashboards:
│ User Service
│  ├─ Request rate
│  ├─ Error rate
│  ├─ p95 latency
│  ├─ Database connections
│  └─ CPU usage
│
│ Content Service
│  ├─ Post creation rate
│  ├─ Search query performance
│  └─ Cache hit rate
│
│ [Overall Platform]
│  ├─ Request throughput (req/sec)
│  ├─ Error rate (%)
│  └─ p99 latency
```

### Distributed Tracing (Jaeger)
```
Request: POST /posts
    │
    ├─→ trace_id: abc123
    │
    ├─→ Content Service (span_1)
    │   │ duration: 150ms
    │   │
    │   ├─→ User Service call (span_2)
    │   │   duration: 45ms
    │   │
    │   └─→ Database query (span_3)
    │       duration: 60ms
    │
    └─→ Elasticsearch call (span_4)
        duration: 30ms

Total: 150ms
Shows where time is spent, bottlenecks
```

### Alerts (PagerDuty)
```yaml
rules:
- alert: HighErrorRate
  expr: rate(errors_total[5m]) > 0.05
  for: 5m
  annotations:
    summary: "Error rate > 5% on {{ $labels.service }}"

- alert: ServiceDown
  expr: up{job="user-service"} == 0
  for: 1m
  annotations:
    summary: "User Service is down!"

- alert: DatabaseLatency
  expr: histogram_quantile(0.95, database_latency_seconds) > 1
  annotations:
    summary: "Database p95 latency > 1 second"
```

---

## Development Workflow

### Setup Local Environment
```bash
# Clone repo
git clone <repo>
cd persona

# Start infrastructure
docker-compose up -d

# Setup each service
cd backend/services/user-service-python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd ../content-service-go
go mod download

cd ../media-service-nodejs
npm install

cd ../analytics-service-java
mvn clean install

cd ../simulation-service-rust
cargo build
```

### Development Loop (Single Service)
```bash
# User Service development
cd backend/services/user-service-python

# Terminal 1: Run service
fastapi dev src/main.py

# Terminal 2: Run tests
pytest tests/ -v --watch

# Terminal 3: Monitor logs
docker-compose logs -f user-service

# Make changes → Tests run → Service reloads → Check logs
```

### Testing
```bash
# Unit tests (fast, no dependencies)
cd backend/services/user-service-python
pytest tests/unit/ -v

# Integration tests (with Docker databases)
pytest tests/integration/ -v

# End-to-end tests (full system)
pytest tests/e2e/ -v

# Performance tests
pytest tests/performance/ --benchmark

# Contract tests (ensure API compatibility)
pytest tests/contracts/ -v
```

### Pull Request Workflow
```
1. Create branch: git checkout -b feature/xyz
2. Make changes
3. Run local tests: pytest tests/
4. Push: git push origin feature/xyz
5. Create PR
6. CI runs:
   - All tests
   - Code coverage
   - Linting
   - Security scan
7. Merge when green ✓
8. Deploy to staging automatically
9. Deploy to production after approval
```

---

## Troubleshooting

### Service Not Responding
```bash
# Check if service is running
docker-compose ps

# Check logs
docker-compose logs user-service

# Try health endpoint
curl http://localhost:8001/health

# Check database connection
docker-compose exec postgres psql -U postgres -l
```

### Database Migrations Failed
```bash
# Rollback
alembic downgrade -1

# Check status
alembic current

# Reapply
alembic upgrade head
```

### Kafka Messages Not Processing
```bash
# Check topics
docker exec kafka kafka-topics --list --bootstrap-server kafka:9092

# Check consumer lag
docker exec kafka kafka-consumer-groups \
  --bootstrap-server kafka:9092 \
  --group analytics-service \
  --describe

# Reset offset to latest
docker exec kafka kafka-consumer-groups \
  --bootstrap-server kafka:9092 \
  --group analytics-service \
  --reset-offsets \
  --to-latest \
  --topic events \
  --execute
```

---

## Next Steps
1. Start local environment: `docker-compose up`
2. Try all services: `curl http://localhost:8001/docs` (Swagger UI)
3. Understand service interactions
4. Write end-to-end test
5. Deploy to Kubernetes
