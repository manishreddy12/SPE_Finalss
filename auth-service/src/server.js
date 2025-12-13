require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { loadSecretsFromVaultIfConfigured } = require('./config/vault');
const { initUserTable } = require('./models/user.model');
const { shutdown } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await loadSecretsFromVaultIfConfigured();
    await initUserTable();

    const server = app.listen(PORT, () => {
      logger.info({ msg: 'Auth service started', port: PORT });
    });

    const gracefulShutdown = async () => {
      logger.info({ msg: 'Shutting down auth service' });
      server.close(async () => {
        await shutdown();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    logger.error({ msg: 'Failed to start server', err });
    process.exit(1);
  }
}

start();
