const { Worker } = require('bullmq');
const connection = require('../config/redisBull');
const mvpRankingService = require('../services/mvpRankingService');

console.log('[Worker] Initializing MVP Sync worker...');

const mvpWorker = new Worker(
  'mvpSyncQueue',
  async (job) => {
    console.log(`[Worker] Received job: ${job.name} (ID: ${job.id})`);
    
    if (job.name === 'syncLeaderboardJob') {
      const isMft = job.data.isMft || 1;
      const result = await mvpRankingService.syncLeaderboard(isMft);
      return result;
    }
  },
  { 
    connection,
    concurrency: 1 
  }
);

mvpWorker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

mvpWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed:`, err.message);
});

module.exports = mvpWorker;
