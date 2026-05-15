# Development Setup Guide

## Prerequisites

### System Requirements
- Docker & Docker Compose
- Kubernetes (kubectl, minikube/Docker Desktop K8s)
- Git
- Node.js 18+ (for workspace management)
- Python 3.9+ (for User Service)
- Go 1.20+ (for Content Service)
- Java 17+ (for Analytics Service)
- Rust 1.70+ (for Simulation Service)

---

## Quick Start

### 1. Clone & Setup Repository
```bash
cd /workspaces/persona
git init
git add .
git commit -m "Initial project structure"
```

### 2. Service-Specific Setup

#### User Service (Python)
```bash
cd backend/services/user-service-python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Content Service (Go)
```bash
cd backend/services/content-service-go
go mod init github.com/persona/content-service
go get -u ./...
```

#### Media Service (Node.js)
```bash
cd backend/services/media-service-nodejs
npm init -y
npm install express cors dotenv
```

#### Analytics Service (Java)
```bash
cd backend/services/analytics-service-java
# Use Maven or Gradle
mvn archetype:generate -DgroupId=com.persona.analytics
```

#### Simulation Service (Rust)
```bash
cd backend/services/simulation-service-rust
cargo init
```

---

## Docker Setup

### Build All Services
```bash
# From project root
docker-compose build
```

### docker-compose.yml (Template)
Create `docker-compose.yml` in project root:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: persona_dev
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"

  user-service:
    build: ./backend/services/user-service-python
    ports:
      - "8001:8000"
    depends_on:
      - postgres
      - redis

  content-service:
    build: ./backend/services/content-service-go
    ports:
      - "8002:8080"
    depends_on:
      - postgres

  media-service:
    build: ./backend/services/media-service-nodejs
    ports:
      - "8003:3000"
    depends_on:
      - postgres

  analytics-service:
    build: ./backend/services/analytics-service-java
    ports:
      - "8004:8080"
    depends_on:
      - postgres

  simulation-service:
    build: ./backend/services/simulation-service-rust
    ports:
      - "8005:8080"
    depends_on:
      - postgres
```

### Run Services
```bash
docker-compose up -d
```

---

## Database Setup

### PostgreSQL Schema
```bash
# Create migrations folder
mkdir -p databases/migrations

# Initialize database
docker exec persona-postgres psql -U postgres -c "CREATE DATABASE persona_dev;"
```

### Redis Initialization
```bash
docker exec persona-redis redis-cli ping
```

### MongoDB Initialization
```bash
docker exec persona-mongodb mongosh admin
```

---

## Environment Variables

Create `.env` file in each service:

### User Service (.env)
```env
DATABASE_URL=postgresql://postgres:persona_dev@localhost:5432/persona_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
```

### Content Service (.env)
```env
DATABASE_URL=postgresql://postgres:persona_dev@localhost:5432/persona_dev
SERVICE_PORT=8080
```

### Media Service (.env)
```env
DATABASE_URL=postgresql://postgres:persona_dev@localhost:5432/persona_dev
UPLOAD_DIR=/uploads
AWS_S3_BUCKET=persona-media
```

### Analytics Service (.env)
```env
DATABASE_URL=postgresql://postgres:persona_dev@localhost:5432/persona_dev
KAFKA_BROKER=localhost:9092
```

### Simulation Service (.env)
```env
DATABASE_URL=postgresql://postgres:persona_dev@localhost:5432/persona_dev
REDIS_URL=redis://localhost:6379
```

---

## Running Services Locally

### User Service (Python)
```bash
cd backend/services/user-service-python
source venv/bin/activate
fastapi run src/main.py  # Or: uvicorn src.main:app --reload
# Visit: http://localhost:8001
```

### Content Service (Go)
```bash
cd backend/services/content-service-go
go run main.go
# Visit: http://localhost:8002
```

### Media Service (Node.js)
```bash
cd backend/services/media-service-nodejs
npm start
# Visit: http://localhost:8003
```

### Analytics Service (Java)
```bash
cd backend/services/analytics-service-java
mvn spring-boot:run
# Visit: http://localhost:8004
```

### Simulation Service (Rust)
```bash
cd backend/services/simulation-service-rust
cargo run
# Visit: http://localhost:8005
```

---

## API Testing

### Using cURL
```bash
# Test User Service
curl -X POST http://localhost:8001/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Test Content Service
curl -X GET http://localhost:8002/posts

# Test Media Service
curl -X GET http://localhost:8003/media
```

### Using Postman
- Import API collections from `docs/postman/`
- Set up environment variables
- Run tests

---

## Kubernetes Setup (Advanced)

### Deploy to Minikube
```bash
# Start minikube
minikube start

# Build images
eval $(minikube docker-env)
docker-compose build

# Apply K8s manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployments
kubectl get deployments
kubectl get services
```

### Access Services
```bash
# Port forward
kubectl port-forward svc/user-service 8001:8000
kubectl port-forward svc/content-service 8002:8080
# ... etc
```

---

## Monitoring & Logging

### View Logs
```bash
# Docker
docker logs persona-user-service
docker logs persona-content-service

# Kubernetes
kubectl logs deployment/user-service
kubectl logs deployment/content-service
```

### Health Checks
```bash
# Check service health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
```

---

## Common Tasks

### Reset Databases
```bash
docker-compose down -v
docker-compose up -d
```

### Run Tests
```bash
# Python
cd backend/services/user-service-python
pytest tests/

# Go
cd backend/services/content-service-go
go test ./...

# Node.js
cd backend/services/media-service-nodejs
npm test

# Java
cd backend/services/analytics-service-java
mvn test

# Rust
cd backend/services/simulation-service-rust
cargo test
```

### Build & Push Docker Images
```bash
# Build
docker build -t persona/user-service backend/services/user-service-python
docker build -t persona/content-service backend/services/content-service-go
# ... etc

# Push to registry
docker push persona/user-service
docker push persona/content-service
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find & kill process using port
lsof -i :8001
kill -9 <PID>
```

### Database Connection Error
```bash
# Check database is running
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d persona_dev
```

### Service Won't Start
```bash
# Check logs
docker logs <service-name>
docker logs -f <service-name>  # Follow logs
```

---

## Next Steps

1. ✅ Set up Docker environment
2. ✅ Initialize each service boilerplate
3. ⏭️ Define API contracts (OpenAPI/Swagger)
4. ⏭️ Set up database schemas
5. ⏭️ Implement core business logic
6. ⏭️ Add inter-service communication

---

**All services should be running on these ports:**
- User Service: 8001
- Content Service: 8002
- Media Service: 8003
- Analytics Service: 8004
- Simulation Service: 8005
