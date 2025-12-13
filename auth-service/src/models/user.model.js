const { query } = require('../config/db');

// Ensure table exists (optional safety)
async function initUserTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function findUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash, role }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

module.exports = {
  initUserTable,
  findUserByEmail,
  createUser,
  findUserById
};
