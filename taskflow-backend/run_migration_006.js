/**
 * run_migration_006.js
 * 
 * Runs the 006 migration: creates notes_pages, notes_blocks, note_shares tables
 * and adds plan columns to users. Handles older MySQL versions gracefully.
 * 
 * Usage:
 *   node run_migration_006.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port:     Number(process.env.DB_PORT || 3306),
        ssl:      { rejectUnauthorized: false },
    });

    console.log('[Migration] Connected to database.');

    const stmts = [
        // ── Notes Pages ─────────────────────────────────────────────────────────
        `CREATE TABLE IF NOT EXISTS notes_pages (
            id           VARCHAR(36)  PRIMARY KEY,
            user_id      INT UNSIGNED NOT NULL,
            parent_id    VARCHAR(36)  DEFAULT NULL,
            title        VARCHAR(255) DEFAULT 'Untitled',
            emoji        VARCHAR(10)  DEFAULT '📄',
            position     INT          DEFAULT 0,
            writing_mode VARCHAR(20)  DEFAULT NULL,
            created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES notes_pages(id) ON DELETE CASCADE
        )`,

        // ── Notes Blocks ─────────────────────────────────────────────────────────
        `CREATE TABLE IF NOT EXISTS notes_blocks (
            id         VARCHAR(36)  PRIMARY KEY,
            page_id    VARCHAR(36)  NOT NULL,
            type       VARCHAR(30)  DEFAULT 'p',
            content    MEDIUMTEXT,
            checked    TINYINT(1)   DEFAULT 0,
            position   INT          DEFAULT 0,
            indent     INT          DEFAULT 0,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE
        )`,

        // ── Note Shares ──────────────────────────────────────────────────────────
        `CREATE TABLE IF NOT EXISTS note_shares (
            id         VARCHAR(36)  PRIMARY KEY,
            token      VARCHAR(64)  NOT NULL UNIQUE,
            page_id    VARCHAR(36)  NOT NULL,
            shared_by  INT UNSIGNED NOT NULL,
            expires_at DATETIME     NOT NULL,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id)   REFERENCES notes_pages(id) ON DELETE CASCADE,
            FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
        )`,
    ];

    // Execute table creation statements
    for (const sql of stmts) {
        try {
            await conn.query(sql);
            const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || '?';
            console.log(`[Migration] ✓ Table ${tableName} OK`);
        } catch (err) {
            console.error('[Migration] Error in statement:', err.message);
        }
    }

    // Add plan column to users — silently ignore if already exists
    try {
        await conn.query(`ALTER TABLE users ADD COLUMN plan ENUM('free', 'pro') DEFAULT 'free'`);
        console.log('[Migration] ✓ Added plan column to users');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
            console.log('[Migration] ✓ plan column already exists in users');
        } else {
            console.warn('[Migration] plan column:', e.message);
        }
    }

    try {
        await conn.query(`ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMP NULL DEFAULT NULL`);
        console.log('[Migration] ✓ Added plan_expires_at column to users');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
            console.log('[Migration] ✓ plan_expires_at already exists in users');
        } else {
            console.warn('[Migration] plan_expires_at:', e.message);
        }
    }

    // Add writing_mode to notes_pages if not present (for users who ran an earlier migration)
    try {
        await conn.query(`ALTER TABLE notes_pages ADD COLUMN writing_mode VARCHAR(20) DEFAULT NULL`);
        console.log('[Migration] ✓ Added writing_mode to notes_pages');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
            console.log('[Migration] ✓ writing_mode already exists in notes_pages');
        } else {
            console.warn('[Migration] writing_mode:', e.message);
        }
    }

    // Cleanup expired share tokens
    try {
        const [res] = await conn.query(`DELETE FROM note_shares WHERE expires_at < NOW()`);
        console.log(`[Migration] ✓ Cleaned up ${res.affectedRows} expired share token(s)`);
    } catch (e) {
        console.warn('[Migration] Cleanup tokens:', e.message);
    }

    await conn.end();
    console.log('[Migration] Done ✓');
}

run().catch(e => { console.error(e); process.exit(1); });
