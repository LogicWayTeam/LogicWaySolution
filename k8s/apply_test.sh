#!/bin/bash

# --- apply configmaps and secrets ---
kubectl apply -f test-env/configmap.yaml -n test
kubectl apply -f base/secret.yaml -n test

# --- apply deployments ---
kubectl apply -f base/frontend/frontend-deployment.yaml -n test
kubectl apply -f base/logicway/logicway-deployment.yaml -n test
kubectl apply -f base/postgres/postgres-deployment.yaml -n test
kubectl apply -f base/route-engine/route-engine-deployment.yaml -n test

# --- apply services ---
kubectl apply -f test-env/services/ -n test

# --- apply jobs ---
kubectl apply -f base/logicway/job-load-data.yaml -n test