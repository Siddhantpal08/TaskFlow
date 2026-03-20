require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'taskflow',
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected to DB. Adding columns...');

        const columns = [
            'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE',
            'ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL'
        ];

        for (const sql of columns) {
            try {
                await connection.query(sql);
                console.log(`Successfully ran: ${sql}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${sql}`);
                } else {
                    console.error(`Error running ${sql}:`, err.message);
                }
            }
        }
        await connection.end();
        console.log('Done.');
    } catch (e) {
        console.error(e);
    }
}
run();
