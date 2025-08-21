#!/bin/bash

# --- apply configmaps and secrets ---
kubectl apply -f test-env/configmap.yaml -n test
kubectl apply -f test-env/secret.yaml -n test

# --- apply deployments ---
kubectl apply -f test-env/frontend/frontend-deployment.yaml -n test
kubectl apply -f test-env/logicway/logicway-deployment.yaml -n test
kubectl apply -f test-env/postgres/postgres-deployment.yaml -n test
kubectl apply -f test-env/route-engine/route-engine-deployment.yaml -n test

# --- apply services ---
kubectl apply -f test-env/services/ -n test

# --- apply jobs ---
kubectl apply -f test-env/logicway/job-load-data.yaml -n test