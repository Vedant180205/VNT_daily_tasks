const cron = require("node-cron");
const mvpRankingService = require("../services/mvpRankingService");

/**
 * Initializes all background cron jobs for the application.
 * Note: Check process.env.ENABLE_CRON if scaling to multiple instances.
 */
function initCronJobs() {
  if (process.env.ENABLE_CRON === "true") {
    console.log("[Cron] Initializing scheduled background jobs...");

    // Run MVP Sync every 1 minute for testing
    cron.schedule("* * * * *", async () => {
      console.log("[Cron] Triggering scheduled MVP Leaderboard Sync...");
      // The service handles its own try/catch and logging now.
      await mvpRankingService.syncLeaderboard(1);
    });

    console.log("[Cron] MVP Leaderboard Sync scheduled to run every 1 minute.");
  } else {
    console.log("[Cron] ENABLE_CRON is not 'true'. Cron scheduler is disabled on this instance.");
  }
}

module.exports = { initCronJobs };
