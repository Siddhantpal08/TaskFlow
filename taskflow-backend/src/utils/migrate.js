require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
    try {
        console.log('⏳ Connecting to Database for Migration...');
        // We use a separate pool configuration without the DB name first, just in case the DB doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true, // required to run multiple SQL queries separated by semicolons
        });

        const dbName = process.env.DB_NAME || 'taskflow';

        // Ensure Database exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);
        console.log(`✅ Database '${dbName}' is ready.`);

        // Read the SQL script
        const sqlPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        // Execute migrations
        console.log('⏳ Executing migration script...');
        await connection.query(sqlScript);

        console.log('🚀 Migrations executed successfully! All tables created.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
