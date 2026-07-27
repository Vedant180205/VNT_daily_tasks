const mvpRankingService = require("../services/mvpRankingService");
const pool = require("../config/db");
const redisClient = require("../config/redis");
require("dotenv").config();

async function runJob() {
  console.log("=========================================");
  console.log("   MVP Ranking Sync Job Started");
  console.log("=========================================");
  const startTime = Date.now();

  try {
    // We synchronize the MFT leaderboard
    const result = await mvpRankingService.syncLeaderboard(1);
    
    if (result.success && result.stats) {
      console.log(`\n✅ Sync Completed Successfully!`);
      console.log(`- Logs processed: ${result.stats.logsProcessed}`);
      console.log(`- Players updated: ${result.stats.playersUpdated}`);
    } else {
      console.log(`\n⚠️ Sync finished with no updates:`, result.message);
    }
  } catch (error) {
    console.error(`\n❌ Sync Job Failed:`, error.message);
    process.exitCode = 1;
  } finally {
    const executionTime = Date.now() - startTime;
    console.log(`- Execution time: ${executionTime}ms`);
    console.log("=========================================");
    
    // Close connections gracefully
    await pool.end();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  }
}

// Execute the job immediately when this file is run
runJob();
