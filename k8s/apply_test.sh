#!/bin/bash

# --- apply configmaps and secrets ---
kubectl apply -f test-env/configmap.yaml
kubectl apply -f base/secret.yaml

# --- apply deployments ---
kubectl apply -f base/frontend/frontend-deployment.yaml
kubectl apply -f base/logicway/logicway-deployment.yaml
kubectl apply -f base/postgres/postgres-deployment.yaml
kubectl apply -f base/route-engine/route-engine-deployment.yaml

# --- apply services ---
kubectl apply -f test-env/services/

# --- apply jobs ---
kubectl apply -f base/logicway/job-load-data.yaml