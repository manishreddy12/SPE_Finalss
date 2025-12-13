#!/bin/bash
# setup-dependencies.sh - Run this in your WSL2 terminal

echo "🚀 Starting dependencies..."

# Stop and remove existing containers if they exist
docker rm -f payment_postgres payment_redis 2>/dev/null || true

# Start Postgres
echo "Starting Postgres..."
docker run -d --name payment_postgres \
  -e POSTGRES_USER=paymentuser \
  -e POSTGRES_PASSWORD=paymentpass \
  -e POSTGRES_DB=paymentdb \
  -p 5432:5432 \
  postgres:15-alpine

# Start Redis
echo "Starting Redis..."
docker run -d --name payment_redis \
  -p 6379:6379 \
  redis:7-alpine

# Wait for Postgres to be ready
echo "Waiting for Postgres to be ready..."
sleep 5

# Initialize database
echo "Initializing database..."
node init_db.js

echo "✅ Dependencies are ready!"
echo ""
echo "You can now run:"
echo "  npm run dev    # Start the app"
echo "  node e2etest.js   # Run tests"
