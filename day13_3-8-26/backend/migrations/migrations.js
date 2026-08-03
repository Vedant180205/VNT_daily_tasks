const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigration() {
    let connection;

    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        // Ensure schema_migrations table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Fetch executed migrations
        const [executedRows] = await connection.query("SELECT migration_name FROM schema_migrations");
        const executedSet = new Set(executedRows.map(r => r.migration_name));

        // If schema_migrations was empty, record all existing pre-redesign migrations as executed
        if (executedSet.size === 0) {
            const legacyFiles = [
                '001_create_players.sql',
                '002_create_users_table.sql',
                '003_create_teams_table.sql',
                '004_add_team_id_to_players.sql',
                '005_add_image_columns_to_players.sql',
                '006_day8_rbac_setup.sql',
                '007_revise_organizers_table.sql',
                '20260716160001_create_countries.sql',
                '20260716160002_create_states.sql',
                '20260716160003_create_cities.sql',
                '20260717214100_create_enrollments.sql'
            ];
            for (const legFile of legacyFiles) {
                await connection.query("INSERT IGNORE INTO schema_migrations (migration_name) VALUES (?)", [legFile]);
                executedSet.add(legFile);
            }
        }

        // Read all SQL migration files in the directory
        const files = fs.readdirSync(__dirname)
            .filter(file => file.endsWith(".sql"))
            .sort();

        // Execute each unexecuted migration
        for (const file of files) {
            if (executedSet.has(file)) {
                console.log(`Skipping executed migration: ${file}`);
                continue;
            }

            console.log(`Executing migration: ${file}`);
            const migrationPath = path.join(__dirname, file);
            const sql = fs.readFileSync(migrationPath, "utf8");
            await connection.query(sql);
            await connection.query("INSERT INTO schema_migrations (migration_name) VALUES (?)", [file]);
            console.log(`Applied migration: ${file}`);
        }

        console.log("Migration process completed successfully.");
    } catch (error) {
        console.error("Migration failed.");
        console.error(error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();