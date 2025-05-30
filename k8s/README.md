# LogicWay Kubernetes Deployment

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
ssh -L 8000:192.168.49.2:30001 devops@logicway-k8s.taile241c6.ts.net
```

#### Access from the browser
Open your browser and go to `http://localhost:8000`. You should see the LogicWay application running.



