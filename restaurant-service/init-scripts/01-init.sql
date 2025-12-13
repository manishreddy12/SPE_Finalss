-- Create tables for restaurant service

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    cuisines VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial data
INSERT INTO restaurants (name, address, phone, cuisines) 
VALUES 
('Burger King', '123 Burger Lane', '555-0123', 'American, Fast Food'),
('Pizza Palace', '456 Dough Drive', '555-0456', 'Italian, Pizza');

-- Seed menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available)
VALUES (1, 'Whopper', 'Flame-grilled burger', 12.75, 'Burgers', true);
