#!/bin/bash

# --- apply configmaps and secrets ---
kubectl apply -f preprod-env/configmap.yaml -n preprod
kubectl apply -f base/secret.yaml -n preprod

# --- apply deployments ---
kubectl apply -f base/frontend/frontend-deployment.yaml -n preprod
kubectl apply -f base/logicway/logicway-deployment.yaml -n preprod
kubectl apply -f base/postgres/postgres-deployment.yaml -n preprod
kubectl apply -f base/route-engine/route-engine-deployment.yaml -n preprod

# --- apply services ---
kubectl apply -f preprod-env/services/ -n preprod

# --- apply jobs ---
kubectl apply -f base/logicway/job-load-data.yaml -n preprod