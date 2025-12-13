module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  SERVICE_NAME: process.env.SERVICE_NAME || 'restaurant-service',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'foodorder_db',
  DB_USER: process.env.DB_USER || 'foodorder_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN || '5'),
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || '20'),
  DB_POOL_IDLE_TIMEOUT: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_min_32_chars_long',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

  // Vault
  VAULT_ADDR: process.env.VAULT_ADDR || 'http://vault:8200',
  VAULT_TOKEN: process.env.VAULT_TOKEN || 'your_vault_token',
  VAULT_PATH: process.env.VAULT_PATH || 'secret/foodorder',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FORMAT: process.env.LOG_FORMAT || 'json',

  // CORS
  corsOptions: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(','),
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};
