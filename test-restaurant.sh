#!/bin/bash

# test-restaurant.sh

BASE_URL="http://localhost:3001/restaurants"

# Read Token
if [ -f ".token" ]; then
    TOKEN=$(cat .token)
    HEADER="Authorization: Bearer $TOKEN"
else
    echo "⚠️  WARNING: No token file found. Run test-auth.sh first."
    HEADER=""
fi

echo "🧪 Testing Restaurant Service..."

# 1. List Restaurants test
echo -e "\n[1] Listing Restaurants..."
curl -s -X GET "$BASE_URL" | tee list_response.json | python3 -m json.tool || cat list_response.json

# 2. Create Restaurant (Admin)
echo -e "\n[2] Creating Restaurant (Requires Admin Token)..."
RANDOM_ID=$RANDOM
BODY=$(cat <<EOF
{
    "name": "Tasty Burger ${RANDOM_ID}",
    "address": "123 Food St",
    "phone": "555-0123",
    "cuisine": "American"
}
EOF
)

curl -s -X POST "$BASE_URL" \
     -H "Content-Type: application/json" \
     -H "$HEADER" \
     -d "$BODY" | tee create_response.json | python3 -m json.tool || cat create_response.json
