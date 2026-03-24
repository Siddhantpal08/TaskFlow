const cron = require('node-cron');
const db = require('./db');
const { sendEventReminderEmail } = require('./mailer');
const { getUserById } = require('../models/userModel');

// Run every day at 08:00 AM (server time/IST depending on setup)
const startReminderJob = () => {
    console.log('[Cron] Starting event reminder job (Runs at 08:00 daily)');

    // 0 8 * * * means 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('[Cron] Running daily event reminder check...');

            // Look for events that happen tomorrow
            // 1. One-time events where event_date is exactly tomorrow
            // 2. Weekly events where tomorrow is between event_date and end_date (or no end date) AND the day-of-week matches
            // 3. Monthly events where tomorrow is between event_date and end_date (or no end date) AND the day-of-month matches

            const [events] = await db.query(`
                SELECT * FROM events 
                WHERE 
                   (recurrence = 'none' AND event_date = CURDATE() + INTERVAL 1 DAY)
                   OR 
                   (recurrence = 'weekly' 
                    AND (event_date <= CURDATE() + INTERVAL 1 DAY) 
                    AND (end_date IS NULL OR end_date >= CURDATE() + INTERVAL 1 DAY)
                    AND DAYOFWEEK(event_date) = DAYOFWEEK(CURDATE() + INTERVAL 1 DAY))
                   OR
                   (recurrence = 'monthly'
                    AND (event_date <= CURDATE() + INTERVAL 1 DAY)
                    AND (end_date IS NULL OR end_date >= CURDATE() + INTERVAL 1 DAY)
                    AND DAYOFMONTH(event_date) = DAYOFMONTH(CURDATE() + INTERVAL 1 DAY))
            `);

            if (events.length === 0) {
                console.log('[Cron] No events tomorrow requiring reminders.');
                return;
            }

            console.log(`[Cron] Found ${events.length} event(s) for tomorrow. Sending emails...`);

            // To format tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateString = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

            for (const event of events) {
                const user = await getUserById(event.user_id);
                if (user && user.email) {
                    await sendEventReminderEmail(
                        user.email,
                        event.title,
                        dateString,
                        event.event_time ? event.event_time.slice(0, 5) : null
                    );
                }
            }

            console.log('[Cron] Reminder emails sent.');
        } catch (error) {
            console.error('[Cron Error] Failed to process event reminders:', error);
        }
    });
};

module.exports = { startReminderJob };
