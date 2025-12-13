#!/bin/bash

# deploy-k8s.sh
# Deploys the Food Ordering microservices to Kubernetes

NAMESPACE="food-app"

echo "🚀 Starting Deployment to Kubernetes..."

# 1. Create Namespace
echo "Creating namespace $NAMESPACE..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 2. Build Images (Local)
echo "📦 Building Docker images..."
eval $(minikube docker-env) # Point to minikube's docker daemon if using minikube
# If not using minikube, this might need adjustment, but assuming local dev env

docker build -t auth-service:latest ./auth-service
docker build -t order-service:latest ./order-service
docker build -t payment-service:latest ./payment-service
docker build -t restaurant-service:latest ./restaurant-service

# 3. Apply Common Resources (DB, Redis)
echo "🗄️  Deploying Databases..."
kubectl apply -f payment-service/k8s/postgres.yaml -n $NAMESPACE
kubectl apply -f payment-service/k8s/redis.yaml -n $NAMESPACE

# Wait for Postgres
echo "Waiting for Postgres to be ready..."
kubectl wait --namespace $NAMESPACE \
  --for=condition=ready pod \
  --selector=app=postgres \
  --timeout=90s

# 4. Initialize Database Schemas
echo "🛠️  Initializing Database Schemas..."
# Get the postgres pod name
PG_POD=$(kubectl get pods -n $NAMESPACE -l app=postgres -o jsonpath="{.items[0].metadata.name}")

# Copy and Exec Schema Scripts
# Auth Schema
if [ -f "./auth-service/schema.sql" ]; then
    echo "Applying Auth Schema..."
    kubectl cp ./auth-service/schema.sql $NAMESPACE/$PG_POD:/tmp/auth_schema.sql
    kubectl exec -n $NAMESPACE $PG_POD -- env PGPASSWORD=paymentpass psql -U paymentuser -d paymentdb -f /tmp/auth_schema.sql
fi

# Restaurant Schema
if [ -f "./restaurant-service/init-scripts/01-init.sql" ]; then
    echo "Applying Restaurant Schema..."
    kubectl cp ./restaurant-service/init-scripts/01-init.sql $NAMESPACE/$PG_POD:/tmp/restaurant_schema.sql
    kubectl exec -n $NAMESPACE $PG_POD -- env PGPASSWORD=paymentpass psql -U paymentuser -d paymentdb -f /tmp/restaurant_schema.sql
fi

# Order Schema
if [ -f "./order-service/schema.sql" ]; then
    echo "Applying Order Schema..."
    kubectl cp ./order-service/schema.sql $NAMESPACE/$PG_POD:/tmp/order_schema.sql
    kubectl exec -n $NAMESPACE $PG_POD -- env PGPASSWORD=paymentpass psql -U paymentuser -d paymentdb -f /tmp/order_schema.sql
fi

# 5. Apply Service Configs and Deployments
echo "🚀 Deploying Services..."

# Auth
kubectl apply -f auth-service/k8s/config.yaml -n $NAMESPACE
kubectl apply -f auth-service/k8s/secret.yaml -n $NAMESPACE
kubectl apply -f auth-service/k8s/deployment.yaml -n $NAMESPACE
kubectl apply -f auth-service/k8s/service.yaml -n $NAMESPACE

# Order
kubectl apply -f order-service/k8s/configmap.yaml -n $NAMESPACE
kubectl apply -f order-service/k8s/secrets.yaml -n $NAMESPACE
kubectl apply -f order-service/k8s/deployment.yaml -n $NAMESPACE

# Payment
kubectl apply -f payment-service/k8s/configmap.yaml -n $NAMESPACE
kubectl apply -f payment-service/k8s/secrets.yaml -n $NAMESPACE
kubectl apply -f payment-service/k8s/deployment.yaml -n $NAMESPACE

# Restaurant
kubectl apply -f restaurant-service/k8s/configmap.yaml -n $NAMESPACE
kubectl apply -f restaurant-service/k8s/secrets.yaml -n $NAMESPACE
kubectl apply -f restaurant-service/k8s/deployment.yaml -n $NAMESPACE

echo "📈 Applying HPA..."
kubectl apply -f auth-service/k8s/hpa.yaml -n $NAMESPACE
kubectl apply -f order-service/k8s/hpa.yaml -n $NAMESPACE
kubectl apply -f payment-service/k8s/hpa.yaml -n $NAMESPACE
kubectl apply -f restaurant-service/k8s/hpa.yaml -n $NAMESPACE

echo "📝 Deploying Filebeat for ELK..."
kubectl apply -f filebeat.yaml

echo "✅ Deployment Complete! Check status with: kubectl get pods -n $NAMESPACE"
