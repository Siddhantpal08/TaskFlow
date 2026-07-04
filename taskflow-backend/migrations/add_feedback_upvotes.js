/**
 * Migration: Add upvotes system to feedback
 * Run this once via: node migrations/add_feedback_upvotes.js
 */
require('dotenv').config();
const db = require('../src/utils/db');

async function migrate() {
    console.log('[Migration] Adding upvotes support to feedback...');
    
    // Add upvotes column to feedback table
    await db.query(`
        ALTER TABLE feedback 
        ADD COLUMN upvotes INT NOT NULL DEFAULT 0,
        ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0
    `).catch(err => {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('[Migration] upvotes column already exists, skipping.');
        } else throw err;
    });

    // Create feedback_votes join table (prevents double voting)
    await db.query(`
        CREATE TABLE IF NOT EXISTS feedback_votes (
            id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id    INT UNSIGNED NOT NULL,
            feedback_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_vote (user_id, feedback_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
        )
    `);

    console.log('[Migration] ✅ Done. feedback.upvotes + feedback_votes table created.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('[Migration] ❌ Failed:', err);
    process.exit(1);
});
