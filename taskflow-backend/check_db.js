require('dotenv').config();
const db = require('./src/utils/db');
(async () => {
    try {
        await db.query("ALTER TABLE feedback ADD COLUMN status ENUM('pending', 'done') NOT NULL DEFAULT 'pending'");
        console.log("Migration successful");
    } catch(e) { 
        if (e.code === 'ER_DUP_FIELDNAME') console.log("Column already exists");
        else console.error(e); 
    }
    process.exit();
})();
