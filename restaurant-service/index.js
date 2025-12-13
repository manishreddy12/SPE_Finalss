require('dotenv').config();
const app = require('./src/server');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME || 'Restaurant Service'} running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
