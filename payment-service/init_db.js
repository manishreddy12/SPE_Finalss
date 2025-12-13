require('dotenv').config();

// Override DB password for Docker setup if not set
if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === '') {
    process.env.DB_PASSWORD = 'paymentpass';
}

const pool = require('./src/config/database');
const logger = require('./src/config/logger');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    fraud_reason TEXT,
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
`;

const initDb = async () => {
    try {
        console.log('Initializing database...');
        await pool.query(createTableQuery);
        console.log('✅ Table "payments" created or already exists.');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await pool.end();
        process.exit();
    }
};

initDb();
