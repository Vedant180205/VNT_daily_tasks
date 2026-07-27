const app = require("./app");
const { initializeMvpScheduler } = require("./queues/mvpQueue");

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initialize background scheduling
    try {
        await initializeMvpScheduler();
    } catch (err) {
        console.error("Failed to initialize MVP scheduler:", err);
    }
});