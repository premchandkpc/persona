# Kubernetes — Interview Prep & Tricky Points

Kubernetes deployment manifests for production deployment of all Persona services.

---

## Core Concepts — Interview Questions

**Q: What is a Pod vs a Deployment vs a Service?**
A: **Pod**: smallest unit — one or more containers with shared network/storage. Ephemeral — can die at any time. **Deployment**: manages ReplicaSets — declaratively describes desired state (N replicas, rolling update strategy). **Service**: stable network endpoint (ClusterIP) that load-balances across Pods, abstracting their ephemeral IPs.

**Q: Why use StatefulSet for PostgreSQL but Deployment for the user service?**
A: StatefulSet gives stable network identities (pod-X.service) and ordered starting/stopping — essential for databases with leader election and persistent storage claims. The user service is stateless — any replica can handle any request — so Deployment (unordered, identical replicas) is sufficient.

**Q: What is an Ingress and why do you need it?**
A: Ingress is a Kubernetes API object that manages external HTTP/HTTPS access to services. It provides host-based routing (`api.persona.com/user` → user-service), TLS termination, and rate limiting. Without Ingress, you'd need a LoadBalancer Service per endpoint.

**Q: Explain the rolling update strategy.**
A: Default strategy: `maxSurge=25%` (can create 25% extra Pods during update) and `maxUnavailable=25%` (can take down 25% of old Pods). New Pods are created, health-checked, then old ones are terminated. This ensures zero-downtime deployments.

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Pod startup race** | A Pod is marked "Ready" before the app is actually ready | Configure `readinessProbe` (app-level health) and `livenessProbe` (process health) |
| **Resource limits missing** | One Pod can starve others of CPU/memory | Always set `requests` (guaranteed) and `limits` (max allowed) |
| **Config in images** | Hardcoded config means rebuilding the image per environment | Use ConfigMaps (non-secret) and Secrets (DB passwords, API keys) |
| **PVC not bound** | Pod is stuck in Pending because the PVC can't find a PV | Ensure a StorageClass exists, or create a PV manually |
| **Service mesh overhead** | Istio/Linkerd adds latency and complexity | Start without a mesh. Add only when you need mTLS, traffic splitting, or observability |
| **NodePort vs LoadBalancer vs Ingress** | Using the wrong Service type wastes resources | NodePort = dev/debug, LoadBalancer = direct exposure, Ingress = production routing |
| **Namespace isolation** | All resources in default namespace creates collisions | Use namespaces per environment (dev, staging, prod) and per team |

## Key Interview Questions

**Q: How do you handle secrets in Kubernetes?**
A: Native Secrets are base64-encoded (not encrypted at rest). For production: use External Secrets Operator (syncs from AWS Secrets Manager / HashiCorp Vault) or Sealed Secrets (encrypted Git-committed secrets). Never commit raw secrets to Git.

**Q: How do you debug a CrashLoopBackOff?**
A: `kubectl logs <pod>` → check app error. `kubectl describe pod <pod>` → check events (OOMKilled, ImagePullBackOff). `kubectl exec -it <pod> -- sh` → inspect the container. Common causes: missing ConfigMap/Secret, wrong command, OOM, missing dependencies.

**Q: What is a HorizontalPodAutoscaler (HPA)?**
A: HPA automatically scales Pod replicas based on CPU/memory utilization or custom metrics. Example: scale user-service when CPU > 70%. Min replicas = 2, max = 10. Cooldown period prevents thrashing.

**Q: How do you handle canary deployments?**
A: Use a Service mesh (Istio) or multiple Deployments with a weighted Service. Route 95% traffic to stable, 5% to canary. Monitor error rates and latency. If canary is healthy, gradually increase weight to 100%. If not, roll back to 0%.

## Useful Commands

```bash
# Debug
kubectl describe pod <name>
kubectl logs <name> --tail=50 -f
kubectl exec -it <name> -- sh

# Port forward (no ingress needed)
kubectl port-forward svc/user-service 8001:8000

# Scale
kubectl scale deployment user-service --replicas=5

# Rolling restart
kubectl rollout restart deployment/user-service

# Check rollout status
kubectl rollout status deployment/user-service
```
