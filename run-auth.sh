#!/bin/bash

# run-auth.sh

echo "🚀 Deploying Auth Service..."

# Stop existing
docker rm -f auth-service 2>/dev/null

# Build
echo "Building Auth Service..."
cd auth-service
docker build -t auth-service .
cd ..

# Run
echo "Running Auth Service..."
docker run -d --name auth-service --network food-ordering-net \
  -p 3000:3000 \
  -e PORT=3000 \
  -e PG_HOST=postgres-db \
  -e PG_USER=paymentuser \
  -e PG_PASSWORD=paymentpass \
  -e PG_DATABASE=paymentdb \
  -e JWT_SECRET=testsecret \
  auth-service

echo "✅ Auth Service running on port 3000"
