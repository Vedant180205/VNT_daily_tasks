const { QueueEvents } = require('bullmq');
const connection = require('../config/redisBull');

const playerQueueEvents = new QueueEvents('players', { connection });

playerQueueEvents.on('waiting', ({ jobId }) => {
  console.log(`[Queue Event] Job ${jobId} is waiting`);
});

playerQueueEvents.on('active', ({ jobId, prev }) => {
  console.log(`[Queue Event] Job ${jobId} is now active; previous status was ${prev}`);
});

playerQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`[Queue Event] Job ${jobId} has completed and returned ${returnvalue}`);
});

playerQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[Queue Event] Job ${jobId} has failed with reason: ${failedReason}`);
});

playerQueueEvents.on('progress', ({ jobId, data }) => {
  console.log(`[Queue Event] Job ${jobId} reported progress: ${data}`);
});

playerQueueEvents.on('error', (err) => {
  console.error('[Queue Event] Queue Events error:', err);
});

module.exports = playerQueueEvents;
