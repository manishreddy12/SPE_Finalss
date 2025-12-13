#!/bin/bash

# test-auth.sh

BASE_URL="http://localhost:3000/auth"
echo "🧪 Testing Auth Service..."

# 1. Register
echo -e "\n[1] Registering User..."
RANDOM_ID=$RANDOM
# Schema requires: name, email, password, role
REGISTER_BODY=$(cat <<EOF
{
    "name": "Test User ${RANDOM_ID}",
    "password": "password123",
    "email": "test_${RANDOM_ID}@example.com",
    "role": "admin"
}
EOF
)

curl -s -X POST "$BASE_URL/register" \
     -H "Content-Type: application/json" \
     -d "$REGISTER_BODY" | tee register_response.json | python3 -m json.tool || cat register_response.json

# 2. Login
echo -e "\n[2] Logging In..."
# Login requires: email, password
LOGIN_BODY=$(cat <<EOF
{
    "email": "test_${RANDOM_ID}@example.com",
    "password": "password123"
}
EOF
)

RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
     -H "Content-Type: application/json" \
     -d "$LOGIN_BODY")

# Extract Token (using grep/sed basic parsing to avoid jq dependency if missing, though jq is better)
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo "Login Success! Token captured."
    # Save token without extra quotes or spaces
    echo "$TOKEN" > .token
    echo "Token saved to .token file"
else
    echo "Login failed: No token received"
    echo "Response: $RESPONSE"
fi
