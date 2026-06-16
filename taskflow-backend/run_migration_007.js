/**
 * run_migration_007.js
 * Adds: role, terms_accepted_at columns to users.
 * Sets palsiddhant3@gmail.com as admin.
 *
 * Usage: node run_migration_007.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306), ssl: { rejectUnauthorized: false },
    });
    console.log('[Migration 007] Connected.');

    const steps = [
        [`ADD COLUMN role`,         `ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'`],
        [`ADD COLUMN terms_accepted_at`, `ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMP NULL DEFAULT NULL`],
        [`INDEX plan`,              `CREATE INDEX idx_users_plan ON users(plan)`],
        [`INDEX role`,              `CREATE INDEX idx_users_role ON users(role)`],
        [`INDEX created_at`,        `CREATE INDEX idx_users_created ON users(created_at)`],
        [`SET ADMIN`,               `UPDATE users SET role = 'admin' WHERE email = 'palsiddhant3@gmail.com'`],
    ];

    for (const [label, sql] of steps) {
        try {
            const [result] = await conn.query(sql);
            const info = result.affectedRows !== undefined ? ` (${result.affectedRows} rows)` : '';
            console.log(`[Migration 007] ✓ ${label}${info}`);
        } catch (e) {
            const dup = e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_KEYNAME' || e.errno === 1060 || e.errno === 1061;
            if (dup) console.log(`[Migration 007] ⚠ ${label} — already exists, skipping`);
            else console.error(`[Migration 007] ✗ ${label}: ${e.message}`);
        }
    }

    await conn.end();
    console.log('[Migration 007] Done ✓');
}

run().catch(e => { console.error(e); process.exit(1); });
