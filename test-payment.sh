#!/bin/bash

# test-payment.sh

BASE_URL="http://localhost:3003/payments"

# Read Token
if [ -f ".token" ]; then
    TOKEN=$(cat .token)
    HEADER="Authorization: Bearer $TOKEN"
else
    echo "CRITICAL: No token file found. Run test-auth.sh first."
    exit 1
fi

echo "🧪 Testing Payment Service..."

# 1. Process Payment
echo -e "\n[1] Processing Payment..."
BODY=$(cat <<EOF
{
    "order_id": 12345,
    "amount": 50.00,
    "currency": "USD",
    "payment_method": "credit_card"
}
EOF
)

curl -s -X POST "$BASE_URL" \
     -H "Content-Type: application/json" \
     -H "$HEADER" \
     -d "$BODY" | python3 -m json.tool || echo "Payment failed"
