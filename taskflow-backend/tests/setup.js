const db = require('../src/utils/db');

// Close DB connection after all tests to prevent hanging handles
afterAll(async () => {
    if (db.end) {
        await db.end();
    }
});
