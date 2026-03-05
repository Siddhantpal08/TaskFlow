/**
 * TaskFlow seed script — populates the DB with realistic test data.
 * Run: npm run seed
 * WARNING: Clears all existing data before seeding.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/utils/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

async function seed() {
    console.log('[Seed] Starting...');

    // ── 1. Clear tables (order matters — FK constraints) ───────────────────────
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE notifications');
    await db.query('TRUNCATE TABLE notes_blocks');
    await db.query('TRUNCATE TABLE notes_pages');
    await db.query('TRUNCATE TABLE events');
    await db.query('TRUNCATE TABLE tasks');
    await db.query('TRUNCATE TABLE refresh_tokens');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[Seed] Tables cleared.');

    // ── 2. Users ───────────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', SALT_ROUNDS);

    const users = [
        { name: 'Siddhant Pal', email: 'siddhant@taskflow.app', initials: 'SP' },
        { name: 'Shubham Mendhe', email: 'shubham@taskflow.app', initials: 'SM' },
        { name: 'Ananya Roy', email: 'ananya@taskflow.app', initials: 'AR' },
        { name: 'Dev Kumar', email: 'dev@taskflow.app', initials: 'DK' },
        { name: 'Priya Singh', email: 'priya@taskflow.app', initials: 'PS' },
    ];

    const userIds = [];
    for (const u of users) {
        const [res] = await db.query(
            'INSERT INTO users (name, email, password, avatar_initials) VALUES (?, ?, ?, ?)',
            [u.name, u.email, password, u.initials]
        );
        userIds.push(res.insertId);
        console.log(`[Seed] User created: ${u.name} (id=${res.insertId})`);
    }

    const [sp, sm, ar, dk, ps] = userIds;

    // ── 3. Tasks ───────────────────────────────────────────────────────────────
    const tasks = [
        { title: 'Design new dashboard UI', description: 'Create wireframes for the updated dashboard.', priority: 'high', assigned_by: sp, assigned_to: sm, status: 'active', due_date: '2025-04-01' },
        { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for deploy.', priority: 'high', assigned_by: sp, assigned_to: dk, status: 'pending', due_date: '2025-04-05' },
        { title: 'Write API documentation', description: 'Document all REST endpoints in Postman.', priority: 'medium', assigned_by: sm, assigned_to: ar, status: 'pending', due_date: '2025-04-10' },
        { title: 'User acceptance testing', description: 'Run UAT on staging environment.', priority: 'medium', assigned_by: sp, assigned_to: ps, status: 'done', due_date: '2025-03-20' },
        { title: 'Fix login bug on mobile', description: 'Token refresh fails on Android 10.', priority: 'high', assigned_by: dk, assigned_to: sp, status: 'active', due_date: '2025-03-28' },
    ];

    const taskIds = [];
    for (const t of tasks) {
        const [res] = await db.query(
            `INSERT INTO tasks (title, description, priority, assigned_by, assigned_to, status, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.title, t.description, t.priority, t.assigned_by, t.assigned_to, t.status, t.due_date]
        );
        taskIds.push(res.insertId);
    }

    // Delegation chain: SM delegates task 1 to AR
    const [delegated] = await db.query(
        `INSERT INTO tasks (title, description, priority, assigned_by, assigned_to, parent_task_id, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Design new dashboard UI (delegated)', 'Delegated from Shubham to Ananya.', 'high', sm, ar, taskIds[0], '2025-04-01']
    );
    console.log('[Seed] Tasks and delegation chain created.');

    // ── 4. Notes Pages + Blocks ────────────────────────────────────────────────
    const page1Id = uuidv4();
    await db.query(
        `INSERT INTO notes_pages (id, user_id, title, emoji, position) VALUES (?, ?, ?, ?, ?)`,
        [page1Id, sp, 'Project Overview', '📋', 0]
    );

    const page2Id = uuidv4();
    await db.query(
        `INSERT INTO notes_pages (id, user_id, parent_id, title, emoji, position) VALUES (?, ?, ?, ?, ?, ?)`,
        [page2Id, sp, page1Id, 'Tech Stack Notes', '🔧', 0]
    );

    // Add blocks to page1
    const blocks = [
        { type: 'h1', content: 'TaskFlow Project Overview', position: 0 },
        { type: 'p', content: 'This is a peer-to-peer task management system.', position: 1 },
        { type: 'todo', content: 'Finish backend implementation', checked: 0, position: 2 },
        { type: 'todo', content: 'Complete React Native app', checked: 0, position: 3 },
        { type: 'callout', content: 'Due: End of Week 11', position: 4 },
    ];

    for (const b of blocks) {
        await db.query(
            `INSERT INTO notes_blocks (id, page_id, type, content, checked, position) VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), page1Id, b.type, b.content, b.checked || 0, b.position]
        );
    }
    console.log('[Seed] Notes pages and blocks created.');

    // ── 5. Events ─────────────────────────────────────────────────────────────
    const events = [
        { user_id: sp, title: 'Sprint Planning', event_date: '2025-04-01', event_time: '10:00:00', priority: 'high' },
        { user_id: sp, title: 'Project Demo', event_date: '2025-04-15', event_time: '14:00:00', priority: 'high' },
        { user_id: sm, title: 'Design Review', event_date: '2025-04-03', event_time: '11:30:00', priority: 'medium' },
        { user_id: ar, title: 'API Review', event_date: '2025-04-08', event_time: '09:00:00', priority: 'low' },
        { user_id: sp, title: 'Team Retrospective', event_date: '2025-04-20', event_time: '16:00:00', priority: 'low' },
    ];

    for (const e of events) {
        await db.query(
            `INSERT INTO events (user_id, title, event_date, event_time, priority) VALUES (?, ?, ?, ?, ?)`,
            [e.user_id, e.title, e.event_date, e.event_time, e.priority]
        );
    }
    console.log('[Seed] Events created.');

    // ── 6. Notifications ──────────────────────────────────────────────────────
    const notifications = [
        { user_id: sm, type: 'task_assigned', message: 'You have been assigned: "Design new dashboard UI"', ref_id: taskIds[0] },
        { user_id: dk, type: 'task_assigned', message: 'You have been assigned: "Set up CI/CD pipeline"', ref_id: taskIds[1] },
        { user_id: ar, type: 'task_assigned', message: 'You have been assigned: "Write API documentation"', ref_id: taskIds[2] },
        { user_id: ar, type: 'task_delegated', message: 'A task has been delegated to you: "Design new dashboard UI (delegated)"', ref_id: delegated.insertId },
        { user_id: sp, type: 'status_update', message: 'Task "Fix login bug on mobile" is now Active', ref_id: taskIds[4] },
    ];

    for (const n of notifications) {
        await db.query(
            `INSERT INTO notifications (user_id, type, message, ref_id) VALUES (?, ?, ?, ?)`,
            [n.user_id, n.type, n.message, n.ref_id]
        );
    }
    console.log('[Seed] Notifications created.');

    console.log('\n[Seed] ✅ Complete! Test credentials: any user above, password: "password123"');
    process.exit(0);
}

seed().catch((err) => {
    console.error('[Seed] ❌ Error:', err.message);
    process.exit(1);
});
