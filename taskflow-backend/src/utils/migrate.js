require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbName = process.env.DB_NAME || 'taskflow';

    try {
        console.log('⏳ Connecting to Database for Migration...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,          // connect directly — Aiven doesn't allow CREATE DATABASE
            ssl: { rejectUnauthorized: false }, // Aiven requires SSL
            multipleStatements: true,  // required to run multiple SQL queries
        });

        console.log(`✅ Connected to database '${dbName}'.`);

        // Read the SQL scripts from migrations directory
        const migrationsDir = path.join(__dirname, '../../migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            console.log(`⏳ Executing migration script: ${file}...`);
            const sqlPath = path.join(migrationsDir, file);
            const sqlScript = fs.readFileSync(sqlPath, 'utf8');
            await connection.query(sqlScript);
            console.log(`✅ ${file} executed successfully.`);
        }

        console.log('🚀 Migrations executed successfully! All tables created.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
