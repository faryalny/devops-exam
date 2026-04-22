# FA23-BCS-047 DevOps Exam — Full Workflow Documentation

## Student: FA23-BCS-047

---

## Part 1: Docker

### Base Image & Optimization
- Used `node:18-alpine` — minimal Alpine-based image (~50MB vs ~300MB)
- Used `.dockerignore` to exclude `node_modules`, `.git`, etc.
- Copied `package*.json` first for layer caching (dependencies only reinstall when package.json changes)
- Used `--omit=dev` to skip devDependencies in production image

### Build & Run Commands
```bash
docker build -t fa23-bcs-047 .
docker run -p 3000:3000 fa23-bcs-047
```

---

## Part 2: Git & GitHub

```bash
git init
git add .
git commit -m "Initial commit: FA23-BCS-047 DevOps App"
git remote add origin https://github.com/YOUR_USERNAME/devops-exam.git
git push -u origin main
```

---

## Part 3: Kubernetes on Azure

### Files
- `k8s/deployment.yaml` — 2 replicas, resource limits defined
- `k8s/service.yaml` — LoadBalancer exposing port 80 → 3000

### Deploy Commands
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
kubectl get service devops-exam-service
```

### Scale
```bash
kubectl scale deployment devops-exam-deployment --replicas=3
kubectl get pods
```

---

## Part 4: Troubleshooting
See troubleshooting section in submission PDF.
