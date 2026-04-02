const db = require('./src/utils/db');
(async () => {
    try { await db.query('ALTER TABLE users ADD COLUMN role ENUM("admin","user") DEFAULT "user"'); console.log("ROLE OK"); } catch (e) { console.error("ROLE ERR:", e.sqlMessage); }
    try { await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL'); console.log("GOOGLE OK"); } catch (e) { console.error("GOOGLE ERR:", e.sqlMessage); }
    try { await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL'); console.log("AVATAR OK"); } catch (e) { console.error("AVATAR ERR:", e.sqlMessage); }
    try { await db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL'); console.log("BIO OK"); } catch (e) { console.error("BIO ERR:", e.sqlMessage); }
    try { const [r] = await db.query('SELECT role, google_id FROM users LIMIT 1'); console.log("SELECT OK:", r); } catch (e) { console.error("SELECT ERR:", e.sqlMessage); }
    process.exit(0);
})();
