#!/bin/bash

# test-order.sh

BASE_URL="http://localhost:4000/orders"

# Read Token
if [ -f ".token" ]; then
    TOKEN=$(cat .token)
    HEADER="Authorization: Bearer $TOKEN"
else
    echo "CRITICAL: No token file found. Run test-auth.sh first."
    exit 1
fi

echo "🧪 Testing Order Service..."

# 1. Create Order
echo -e "\n[1] Creating Order..."
BODY=$(cat <<EOF
{
    "restaurant_id": 1,
    "items": [
        { "menu_item_id": 1, "quantity": 2 }
    ],
    "total_price": 25.50
}
EOF
)

curl -s -X POST "$BASE_URL" \
     -H "Content-Type: application/json" \
     -H "$HEADER" \
     -d "$BODY" | tee create_order_response.json | python3 -m json.tool || cat create_order_response.json
