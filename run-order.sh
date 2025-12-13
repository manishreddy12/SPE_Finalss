#!/bin/bash

# run-order.sh

echo "🚀 Deploying Order Service..."

# Stop existing
docker rm -f order-service 2>/dev/null

# Build
echo "Building Order Service..."
cd order-service
docker build -t order-service .
cd ..

# Run
echo "Running Order Service..."
docker run -d --name order-service --network food-ordering-net \
  -p 4000:4000 \
  -e PORT=4000 \
  -e DB_HOST=postgres-db \
  -e DB_USER=paymentuser \
  -e DB_PASSWORD=paymentpass \
  -e DB_NAME=paymentdb \
  -e JWT_SECRET=testsecret \
  -e RESTAURANT_SERVICE_URL=http://restaurant-service:3001 \
  order-service

echo "✅ Order Service running on port 4000"
