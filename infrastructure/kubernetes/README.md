# Kubernetes Manifests

Kubernetes deployment files for production deployment.

## Files
- `namespace.yaml` - Kubernetes namespace
- `user-service.yaml` - User service deployment
- `content-service.yaml` - Content service deployment
- `media-service.yaml` - Media service deployment
- `analytics-service.yaml` - Analytics service deployment
- `simulation-service.yaml` - Simulation service deployment
- `postgres.yaml` - PostgreSQL statefulset
- `redis.yaml` - Redis deployment
- `mongodb.yaml` - MongoDB statefulset
- `ingress.yaml` - Ingress configuration
- `services.yaml` - Kubernetes services

## Deploy
```bash
kubectl apply -f ./
```

## Check Status
```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

## Port Forwarding
```bash
kubectl port-forward svc/user-service 8001:8000
kubectl port-forward svc/content-service 8002:8080
# etc
```
