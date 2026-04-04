const cron = require('node-cron');
const db = require('./db');
const { sendEventReminderEmail } = require('./mailer');
const { getUserById } = require('../models/userModel');
const { sendNotification } = require('../services/notificationService');

const getEventsForDayOffset = async (offsetDays) => {
    const [events] = await db.query(`
        SELECT * FROM events 
        WHERE 
           (recurrence = 'none' AND event_date = CURDATE() + INTERVAL ${offsetDays} DAY)
           OR 
           (recurrence = 'weekly' 
            AND event_date <= CURDATE() + INTERVAL ${offsetDays} DAY
            AND (end_date IS NULL OR end_date >= CURDATE() + INTERVAL ${offsetDays} DAY)
            AND DAYOFWEEK(event_date) = DAYOFWEEK(CURDATE() + INTERVAL ${offsetDays} DAY))
           OR
           (recurrence = 'monthly'
            AND event_date <= CURDATE() + INTERVAL ${offsetDays} DAY
            AND (end_date IS NULL OR end_date >= CURDATE() + INTERVAL ${offsetDays} DAY)
            AND DAYOFMONTH(event_date) = DAYOFMONTH(CURDATE() + INTERVAL ${offsetDays} DAY))
    `);
    return events;
};

const formatDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
};

const startReminderJob = () => {
    console.log('[Cron] Starting all reminder jobs');

    // ── 07:00 Daily: Morning digest — what's ON today ─────────────────────────
    cron.schedule('0 7 * * *', async () => {
        try {
            const events = await getEventsForDayOffset(0);
            for (const event of events) {
                const timeStr = event.event_time ? ` at ${event.event_time.slice(0, 5)}` : '';
                await sendNotification(
                    event.user_id, 'event_reminder',
                    `⏰ Today: "${event.title}"${timeStr} is happening today!`,
                    event.id
                ).catch(console.error);
            }
            console.log(`[Cron] Morning digest: ${events.length} event(s) today`);
        } catch (err) { console.error('[Cron] Morning digest failed:', err); }
    });

    // ── 08:00 Daily: Tomorrow reminder (email + in-app) ───────────────────────
    cron.schedule('0 8 * * *', async () => {
        try {
            const events = await getEventsForDayOffset(1);
            const dateString = formatDate(1);
            for (const event of events) {
                const user = await getUserById(event.user_id);
                if (!user) continue;
                const timeStr = event.event_time ? ` at ${event.event_time.slice(0, 5)}` : '';
                await sendNotification(
                    event.user_id, 'event_reminder',
                    `📅 Reminder: "${event.title}" is tomorrow (${dateString}${timeStr})`,
                    event.id
                ).catch(console.error);
                if (user.email) {
                    await sendEventReminderEmail(
                        user.email, event.title, dateString,
                        event.event_time ? event.event_time.slice(0, 5) : null
                    ).catch(console.error);
                }
            }
            console.log(`[Cron] Tomorrow reminder: ${events.length} event(s)`);
        } catch (err) { console.error('[Cron] Tomorrow reminder failed:', err); }
    });

    // ── 09:00 Daily: Task due-soon alerts (due today or tomorrow) ─────────────
    cron.schedule('0 9 * * *', async () => {
        try {
            const [tasks] = await db.query(`
                SELECT t.*, u.name as assignee_name
                FROM tasks t
                LEFT JOIN users u ON u.id = t.assigned_to
                WHERE t.status NOT IN ('done', 'approved')
                  AND t.due_date IN (CURDATE(), CURDATE() + INTERVAL 1 DAY)
            `);
            for (const task of tasks) {
                const isToday = new Date(task.due_date).toDateString() === new Date().toDateString();
                const label = isToday ? 'today' : 'tomorrow';
                const emoji = isToday ? '🔴' : '🟡';
                if (task.assigned_to) {
                    await sendNotification(
                        task.assigned_to, 'due_soon',
                        `${emoji} Task "${task.title}" is due ${label}`, task.id
                    ).catch(console.error);
                }
                if (task.created_by && task.created_by !== task.assigned_to) {
                    await sendNotification(
                        task.created_by, 'due_soon',
                        `${emoji} Task "${task.title}" (${task.assignee_name || 'unassigned'}) due ${label}`, task.id
                    ).catch(console.error);
                }
            }
            console.log(`[Cron] Due-soon: ${tasks.length} task(s) notified`);
        } catch (err) { console.error('[Cron] Due-soon failed:', err); }
    });

    // ── 18:00 Daily: 1-week-ahead event preview ───────────────────────────────
    cron.schedule('0 18 * * *', async () => {
        try {
            const events = await getEventsForDayOffset(7);
            const dateString = formatDate(7);
            for (const event of events) {
                const timeStr = event.event_time ? ` at ${event.event_time.slice(0, 5)}` : '';
                await sendNotification(
                    event.user_id, 'event_reminder',
                    `📆 Next week: "${event.title}" on ${dateString}${timeStr}`,
                    event.id
                ).catch(console.error);
            }
            console.log(`[Cron] 1-week-ahead: ${events.length} event(s)`);
        } catch (err) { console.error('[Cron] 1-week-ahead failed:', err); }
    });
};

module.exports = { startReminderJob };
