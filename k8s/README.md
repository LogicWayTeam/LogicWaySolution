# LogicWay Kubernetes Deployment

## Setup and Configuration

### Prerequisites
- Ensure you have [kubectl](https://kubernetes.io/docs/tasks/tools/) installed and configured.
- Ensure you have [Helm](https://helm.sh/docs/intro/install/) installed.

### Local Kubernetes Cluster Setup
#### Install Minikube
```bash
minikube start
```

## Rolling Update and Rollback

#### [UPDATE] Change and apply manifests
```bash
kubectl apply -f k8s
```

#### Check the status of the deployment
```bash
kubectl rollout status deployment
```

#### [ROLLBACK] Rollback to the previous version
```bash
kubectl rollout undo deployment
```

### Monitoring Setup

#### Add prometheus and grafana Helm repositories
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Create a namespace
```bash
kubectl create namespace monitoring
```

### Apply Prometheus and Grafana manifests
```bash
helm upgrade --install monitor prometheus-community/kube-prometheus-stack -f helm/values-monitoring.yaml -n monitoring
kubectl apply -f k8s/base/morouting/moroute-engine-servicemonitor.yaml -n monitoring
kubectl apply -f k8s/base/morouting/logicway-servicemonitor.yaml -n monitoring
```

### Testing the Monitoring Setup

#### Access Prometheus
```bash
kubectl --namespace monitoring port-forward svc/prometheus-operated 9090:9090
```

## Remote machine deployment

#### Prerequisites
```bash
git clone https://github.com/LogicWayTeam/LogicWaySolution.git
cd LogicWaySolution
```

#### Apply all manifests
```bash
kubectl apply -f k8s/
```

#### Check the status
```bash
kubectl get all
```

---

#### Access from the client machine (SSH tunnel)
```bash
ssh -L 8000:192.168.49.2:30001 -L 3000:192.168.49.2:30000 devops@logicway-k8s.taile241c6.ts.net
```

#### Access from the browser
Open your browser and go to `http://localhost:3000`. You should see the LogicWay application running.



