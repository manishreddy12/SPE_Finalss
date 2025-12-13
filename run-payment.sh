#!/bin/bash

# run-payment.sh

echo "🚀 Deploying Payment Service..."

# Stop existing
docker rm -f payment-service 2>/dev/null

# Build
echo "Building Payment Service..."
cd payment-service
docker build -t payment-service .
cd ..

# Run
echo "Running Payment Service..."
docker run -d --name payment-service --network food-ordering-net \
  -p 3003:3003 \
  -e PORT=3003 \
  -e DB_HOST=postgres-db \
  -e DB_USER=paymentuser \
  -e DB_PASSWORD=paymentpass \
  -e DB_NAME=paymentdb \
  -e REDIS_HOST=redis \
  -e JWT_SECRET=testsecret \
  payment-service

echo "✅ Payment Service running on port 3003"
