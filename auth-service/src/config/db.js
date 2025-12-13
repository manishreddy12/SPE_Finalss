const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  logger.error({ msg: 'Unexpected error on idle client', err });
  process.exit(1);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function shutdown() {
  await pool.end();
}

module.exports = { pool, query, shutdown };
