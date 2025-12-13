require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'foodorder_db',
    connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    } else {
        console.log('Connection Successful:', res.rows[0]);
        process.exit(0);
    }
});
