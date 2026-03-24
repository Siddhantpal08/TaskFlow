require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Starting Phase 4 DB Migration...");

        // 1. Add refused status
        console.log("Updating tasks status ENUM...");
        await db.query("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending','active','pending_approval','done','refused') DEFAULT 'pending'");
        console.log("✅ tasks.status updated.");

        // 2. Add end_date and recurrence to events
        console.log("Adding end_date and recurrence to events...");
        try {
            await db.query("ALTER TABLE events ADD COLUMN end_date DATE NULL AFTER event_date");
            console.log("✅ events.end_date added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("⚠️ events.end_date already exists.");
            else throw e;
        }

        try {
            await db.query("ALTER TABLE events ADD COLUMN recurrence ENUM('none','weekly','monthly') DEFAULT 'none' AFTER end_date");
            console.log("✅ events.recurrence added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("⚠️ events.recurrence already exists.");
            else throw e;
        }

        // 3. Add bio and avatar_url to users
        console.log("Adding bio and avatar_url to users...");
        try {
            await db.query("ALTER TABLE users ADD COLUMN bio TEXT NULL");
            console.log("✅ users.bio added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("⚠️ users.bio already exists.");
            else throw e;
        }

        try {
            await db.query("ALTER TABLE users ADD COLUMN avatar_url TEXT NULL");
            console.log("✅ users.avatar_url added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("⚠️ users.avatar_url already exists.");
            else throw e;
        }

        console.log("🎉 Phase 4 DB Migration Complete!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
