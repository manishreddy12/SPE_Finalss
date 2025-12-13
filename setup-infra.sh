#!/bin/bash

# setup-infra.sh

echo "🚀 Setting up infrastructure..."

# Create Docker Network
if [ -z "$(docker network ls --format '{{.Name}}' | grep '^food-ordering-net$')" ]; then
    echo "Creating network 'food-ordering-net'..."
    docker network create food-ordering-net
else
    echo "Network 'food-ordering-net' already exists."
fi

# Start Postgres
echo "Starting Postgres..."
docker rm -f postgres-db 2>/dev/null
docker run -d --name postgres-db --network food-ordering-net \
  -e POSTGRES_USER=paymentuser \
  -e POSTGRES_PASSWORD=paymentpass \
  -e POSTGRES_DB=paymentdb \
  -p 5432:5432 \
  postgres:15-alpine

# Start Redis
echo "Starting Redis..."
docker rm -f redis 2>/dev/null
docker run -d --name redis --network food-ordering-net \
  -p 6379:6379 \
  redis:7-alpine

# Wait for DB
echo "Waiting for Postgres to be ready..."
until docker exec postgres-db pg_isready -U paymentuser; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "✅ Infrastructure ready!"

# Initialize Database Schemas
echo "🛠️  Initializing Schemas..."

# Auth Service Schema (Check if exists, Auth usually manages its own, but we check for schema.sql)
if [ -f "./auth-service/schema.sql" ]; then
    echo "Applying Auth Schema..."
    docker cp ./auth-service/schema.sql postgres-db:/tmp/auth_schema.sql
    docker exec -e PGPASSWORD=paymentpass postgres-db psql -U paymentuser -d paymentdb -f /tmp/auth_schema.sql
fi

# Restaurant Service Schema
if [ -f "./restaurant-service/init-scripts/01-init.sql" ]; then
    echo "Applying Restaurant Schema..."
    docker cp ./restaurant-service/init-scripts/01-init.sql postgres-db:/tmp/restaurant_schema.sql
    docker exec -e PGPASSWORD=paymentpass postgres-db psql -U paymentuser -d paymentdb -f /tmp/restaurant_schema.sql
fi

# Order Service Schema
if [ -f "./order-service/schema.sql" ]; then
    echo "Applying Order Schema..."
    docker cp ./order-service/schema.sql postgres-db:/tmp/order_schema.sql
    docker exec -e PGPASSWORD=paymentpass postgres-db psql -U paymentuser -d paymentdb -f /tmp/order_schema.sql
fi

echo "✅ Database Initialized!"
