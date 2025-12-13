#!/bin/bash

NAMESPACE="food-app"
DEPLOYMENT="auth-deployment"
DURATION=60

echo "🚀 Starting Load Test & HPA Monitoring for ${DURATION}s..."

# Function to get pod count
get_pods() {
    kubectl get pods -n $NAMESPACE -l app=auth --no-headers | wc -l
}

INITIAL_PODS=$(get_pods)
echo "📊 Initial Pod Count: $INITIAL_PODS"

# Start Load Generator in background
kubectl run load-generator --image=busybox:1.28 --restart=Never -n $NAMESPACE -- /bin/sh -c "while true; do wget -q -O- http://auth-service:3000/ > /dev/null; done" > /dev/null 2>&1 &
GENERATOR_PID=$!

echo "🔥 Load generator started upon auth-service..."

# Monitor loop
END_TIME=$((SECONDS + DURATION))
while [ $SECONDS -lt $END_TIME ]; do
    CURRENT_PODS=$(get_pods)
    echo "⏱️  Time remaining: $((END_TIME - SECONDS))s | Pods: $CURRENT_PODS"
    sleep 10
done

# Cleanup
echo "🛑 Stopping load generator..."
kubectl delete pod load-generator -n $NAMESPACE --ignore-not-found=true

FINAL_PODS=$(get_pods)
echo "📊 Final Pod Count: $FINAL_PODS"

if [ "$FINAL_PODS" -gt "$INITIAL_PODS" ]; then
    echo "✅ HPA Scaling Verified: Pods increased from $INITIAL_PODS to $FINAL_PODS"
else
    echo "⚠️  No scaling detected. (This might be minimal load or HPA delay)"
fi
