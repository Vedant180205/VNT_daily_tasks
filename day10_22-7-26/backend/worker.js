require('dotenv').config();

// Initialize the worker and queue events
require('./src/workers/playerWorker');
require('./src/queues/queueEvents');

console.log('Worker process is running and listening for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Worker shutting down...');
  process.exit(0);
});
