#!/bin/bash

# cleanup-k8s.sh
NAMESPACE="food-app"

echo "🧹 Cleaning up Kubernetes resources in namespace $NAMESPACE..."
kubectl delete namespace $NAMESPACE

echo "✅ Cleanup complete!"
