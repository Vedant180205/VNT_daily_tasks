const mysql = require("mysql2/promise");
require("dotenv").config();

async function seedRBAC() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Seeding RBAC data...");

        // 1. Seed Roles
        const roles = ['Admin', 'Sub Admin', 'User'];
        for (const role of roles) {
            await connection.query("INSERT IGNORE INTO roles (name) VALUES (?)", [role]);
        }

        // 2. Seed Permissions
        const permissions = [
            'view_players', 'create_players', 'edit_players', 'delete_players',
            'view_teams', 'create_teams'
        ];
        for (const perm of permissions) {
            await connection.query("INSERT IGNORE INTO permissions (name) VALUES (?)", [perm]);
        }

        // Fetch IDs
        const [rolesData] = await connection.query("SELECT id, name FROM roles");
        const roleMap = {};
        rolesData.forEach(r => roleMap[r.name] = r.id);

        const [permsData] = await connection.query("SELECT id, name FROM permissions");
        const permMap = {};
        permsData.forEach(p => permMap[p.name] = p.id);

        // 3. Map Role Permissions
        const rolePermissions = [
            // Admin gets everything
            ...permissions.map(p => [roleMap['Admin'], permMap[p]]),
            
            // Sub Admin
            [roleMap['Sub Admin'], permMap['view_players']],
            [roleMap['Sub Admin'], permMap['create_players']],
            [roleMap['Sub Admin'], permMap['edit_players']],
            [roleMap['Sub Admin'], permMap['view_teams']],
            
            // User
            [roleMap['User'], permMap['view_players']],
            [roleMap['User'], permMap['view_teams']],
        ];

        // Insert mappings
        for (const [roleId, permId] of rolePermissions) {
            await connection.query(
                "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)", 
                [roleId, permId]
            );
        }

        console.log("RBAC Seed Completed Successfully!");
    } catch (err) {
        console.error("Failed to seed RBAC data:", err);
    } finally {
        if (connection) await connection.end();
    }
}

seedRBAC();
