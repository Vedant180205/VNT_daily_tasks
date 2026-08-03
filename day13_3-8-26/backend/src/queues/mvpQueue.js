const { Queue } = require('bullmq');
const connection = require('../config/redisBull');

// Create the MVP Queue
const mvpQueue = new Queue('mvpSyncQueue', { connection });

// Define the repeatable job for automatic synchronization
const initializeMvpScheduler = async () => {
  console.log('[Scheduler] Registering MVP Sync repeatable job...');
  await mvpQueue.add(
    'syncLeaderboardJob',
    { isMft: 1 },
    {
      repeat: {
        pattern: '0 * * * *', // Run exactly at the 0th minute of every hour
      },
      jobId: 'mvp-sync-cron' // Stable jobId prevents duplicates
    }
  );
  console.log('[Scheduler] MVP Sync job registered successfully.');
};

module.exports = {
  mvpQueue,
  initializeMvpScheduler
};
