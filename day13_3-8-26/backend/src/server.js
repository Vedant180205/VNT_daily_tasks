const app = require("./app");
const { initCronJobs } = require("./jobs/cronScheduler");

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    const searchService = require("./services/searchService");
    
    // Initialize background scheduling
    try {
        await searchService.buildIndex();
        initCronJobs();
    } catch (err) {
        console.error("Failed to initialize cron scheduler:", err);
    }
});