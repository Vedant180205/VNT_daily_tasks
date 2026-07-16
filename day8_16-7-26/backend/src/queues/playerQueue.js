const { Queue } = require('bullmq');
const connection = require('../config/redisBull');

const playerQueue = new Queue('players', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true, // Keep redis clean from successful jobs
    removeOnFail: false,    // Keep failed jobs for debugging
  },
});

module.exports = playerQueue;
