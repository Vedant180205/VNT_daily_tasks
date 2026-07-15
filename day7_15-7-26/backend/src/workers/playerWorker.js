const { Worker, UnrecoverableError } = require('bullmq');
const connection = require('../config/redisBull');
const playerService = require('../services/playerService');
const { validatePlayerData } = require('../utils/validators');

const playerWorker = new Worker('players', async (job) => {
  const { name, email, phone, team_id, uploadId } = job.data;
  
  try {
    // 0. Validate Data Formats using shared validator
    validatePlayerData({ name, email, phone });

    // 1. Delegate business validation and db insertion to playerService
    const newPlayer = await playerService.createPlayer({
      name, email, phone, team_id
    });
    
    // 2. Increment completed count in Redis
    if (uploadId) {
      await connection.hincrby(`upload:${uploadId}:status`, 'completed', 1);
    }
    
    return newPlayer;
  } catch (error) {
    const errorDetail = JSON.stringify({
      name: name || 'Unknown',
      email: email || 'Unknown',
      reason: error.message || 'Unknown error'
    });

    // If it's a validation or business logic error (e.g., Email exists), do not retry
    if (error.status) {
      if (uploadId) {
        await connection.hincrby(`upload:${uploadId}:status`, 'failed', 1);
        await connection.rpush(`upload:${uploadId}:errors`, errorDetail);
      }
      throw new UnrecoverableError(error.message);
    }
    
    // 3. For transient errors (e.g., DB down), let BullMQ retry.
    // Only increment failed count on the absolute final attempt
    if (uploadId && job.attemptsMade >= job.opts.attempts - 1) {
      await connection.hincrby(`upload:${uploadId}:status`, 'failed', 1);
      await connection.rpush(`upload:${uploadId}:errors`, errorDetail);
    }
    
    // 4. Re-throw error so BullMQ handles retry mechanism
    throw error;
  }

}, { 
  connection,
  concurrency: 5 // Process up to 5 jobs simultaneously
});

playerWorker.on('error', err => {
  // log the error
  console.error('[Worker] Redis Connection Error:', err);
});

module.exports = playerWorker;
