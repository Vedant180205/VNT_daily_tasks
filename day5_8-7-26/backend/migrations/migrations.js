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

        // Read all SQL migration files in the directory
        const files = fs.readdirSync(__dirname)
            .filter(file => file.endsWith(".sql"))
            .sort();

        // Execute each migration
        for (const file of files) {
            console.log(`Executing migration: ${file}`);
            const migrationPath = path.join(__dirname, file);
            const sql = fs.readFileSync(migrationPath, "utf8");
            await connection.query(sql);
        }

        console.log("Migration executed successfully.");
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