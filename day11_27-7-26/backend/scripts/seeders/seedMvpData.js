const pool = require("../../src/config/db");

async function seedMvpData() {
    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Fetch 10 players from the players table
        const [players] = await connection.query("SELECT id FROM players LIMIT 10");
        
        if (players.length === 0) {
            console.error("No players found in the database. Please seed players first.");
            process.exit(1);
        }

        const logsToInsert = [];
        const matchRefs = ['MATCH_101', 'MATCH_102', 'MATCH_103', 'MATCH_104', 'MATCH_105'];

        // 2. Generate 5 logs for each of the 10 players
        for (const player of players) {
            for (let i = 0; i < 5; i++) {
                logsToInsert.push([
                    player.id,
                    matchRefs[i], // match_reference
                    Math.floor(Math.random() * 50), // batting_points (0-49)
                    Math.floor(Math.random() * 50), // bowling_points (0-49)
                    Math.floor(Math.random() * 20), // fielding_points (0-19)
                    1 // is_mft
                ]);
            }
        }

        // 3. Clear existing logs (for idempotency during seeding)
        await connection.query("TRUNCATE TABLE mvp_performance_logs");
        
        // 4. Bulk insert the logs
        const query = `
            INSERT INTO mvp_performance_logs 
            (player_id, match_reference, batting_points, bowling_points, fielding_points, is_mft) 
            VALUES ?
        `;
        
        const [result] = await connection.query(query, [logsToInsert]);
        
        console.log(`Successfully seeded ${result.affectedRows} performance logs for ${players.length} players.`);

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        if (connection) {
            connection.release();
        }
        pool.end();
    }
}

seedMvpData();
