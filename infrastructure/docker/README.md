# Docker Configuration

Dockerfile templates for each service.

## Services
- `user-service.dockerfile` - Python user service
- `content-service.dockerfile` - Go content service
- `media-service.dockerfile` - Node.js media service
- `analytics-service.dockerfile` - Java analytics service
- `simulation-service.dockerfile` - Rust simulation service

## Build Individual Service
```bash
docker build -f Dockerfile -t persona/user-service ./backend/services/user-service-python
docker build -f Dockerfile -t persona/content-service ./backend/services/content-service-go
# etc
```

## Push to Registry
```bash
docker push persona/user-service
docker push persona/content-service
# etc
```

## Multi-stage Builds
All Dockerfiles use multi-stage builds to minimize image size.
