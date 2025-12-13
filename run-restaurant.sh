#!/bin/bash

# run-restaurant.sh

echo "🚀 Deploying Restaurant Service..."

# Stop existing
docker rm -f restaurant-service 2>/dev/null

# Build
echo "Building Restaurant Service..."
cd restaurant-service
docker build -t restaurant-service .
cd ..

# Run
echo "Running Restaurant Service..."
docker run -d --name restaurant-service --network food-ordering-net \
  -p 3001:3001 \
  -e PORT=3001 \
  -e DB_HOST=postgres-db \
  -e DB_USER=paymentuser \
  -e DB_PASSWORD=paymentpass \
  -e DB_NAME=paymentdb \
  -e JWT_SECRET=testsecret \
  restaurant-service

echo "✅ Restaurant Service running on port 3001"
