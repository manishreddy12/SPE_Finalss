#!/bin/bash
echo "🍔 Seeding Menu Items..."
# Insert Whopper if it doesn't exist
docker exec -e PGPASSWORD=paymentpass postgres-db psql -U paymentuser -d paymentdb -c "INSERT INTO menu_items (id, restaurant_id, name, price, category, is_available) VALUES (1, 1, 'Whopper', 12.75, 'Burgers', true) ON CONFLICT (id) DO NOTHING;"
echo "✅ Menu Item seeded!"
