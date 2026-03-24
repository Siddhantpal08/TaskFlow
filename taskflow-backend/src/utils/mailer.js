/**
 * Send a generic OTP or notification email using Brevo's HTTP API (bypasses Render's SMTP port blocks)
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendOtpEmail = async (to, otp) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('\n[MAIL WARNING]: BREVO_API_KEY is not set. Email NOT sent.');
        console.warn(`To: ${to} | OTP: ${otp}\n`);
        return;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'TaskFlow',
                    email: 'taskflowappbysidd@gmail.com'
                },
                to: [{ email: to }],
                subject: 'TaskFlow — Email Verification',
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #00E5CC;">TaskFlow</h2>
                        <p style="font-size: 16px; color: #333;">Your one-time password (OTP) is:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00E5CC; padding: 16px; background: #f1f5f9; border-radius: 8px; text-align: center;">
                            ${otp}
                        </div>
                        <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
                            This verification code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                        </p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo HTTP Error: ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error('[Email Setup Error]:', error);
        throw error;
    }
};

/**
 * Send an email notification when a task is assigned to a user
 */
const sendTaskAssignedEmail = async (toEmail, taskTitle, assignerName) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('\n[MAIL WARNING]: BREVO_API_KEY is not set. Task Email NOT sent.');
        return;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' },
                to: [{ email: toEmail }],
                subject: `New Task Assigned: ${taskTitle}`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #00E5CC;">New Task Assigned</h2>
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 15px; color: #444;">
                            <strong>${assignerName || 'Someone'}</strong> has assigned a new task to you on TaskFlow:
                        </p>
                        <div style="font-size: 18px; font-weight: bold; color: #00E5CC; padding: 16px; background: #f1f5f9; border-radius: 8px; margin: 16px 0;">
                            "${taskTitle}"
                        </div>
                        <p style="color: #64748b; font-size: 14px;">
                            Log into your dashboard to view the details and start working.
                        </p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Brevo HTTP Error sending task email:`, errorData);
        }
    } catch (error) {
        console.error('[Task Email Error]:', error);
    }
};

const sendTaskRefusedEmail = async (toEmail, taskTitle, assigneeName) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST', headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' }, to: [{ email: toEmail }],
                subject: `Task Refused: ${taskTitle}`,
                htmlContent: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;"><h2 style="color: #FF5252;">Task Refused</h2><p><strong>${assigneeName}</strong> has refused the task "<strong>${taskTitle}</strong>". Log in to reassign or modify.</p></div>`
            })
        });
    } catch (e) { console.error(e); }
};

const sendTaskApprovedEmail = async (toEmail, taskTitle) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST', headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' }, to: [{ email: toEmail }],
                subject: `Task Approved: ${taskTitle}`,
                htmlContent: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;"><h2 style="color: #28c840;">Task Approved</h2><p>Your completion of "<strong>${taskTitle}</strong>" has been approved and marked as done. Great job!</p></div>`
            })
        });
    } catch (e) { console.error(e); }
};

const sendTaskRejectedEmail = async (toEmail, taskTitle) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST', headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' }, to: [{ email: toEmail }],
                subject: `Task Completion Rejected: ${taskTitle}`,
                htmlContent: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;"><h2 style="color: #FF5252;">Task Rejected</h2><p>Your completion of "<strong>${taskTitle}</strong>" has been rejected. The task is active again. Please review feedback in the app.</p></div>`
            })
        });
    } catch (e) { console.error(e); }
};

const sendTaskPendingApprovalEmail = async (toEmail, taskTitle, assigneeName) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST', headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' }, to: [{ email: toEmail }],
                subject: `Approval Required: ${taskTitle}`,
                htmlContent: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;"><h2 style="color: #FF9800;">Pending Approval</h2><p><strong>${assigneeName}</strong> has marked "<strong>${taskTitle}</strong>" as done. Please log in to approve or reject their work.</p></div>`
            })
        });
    } catch (e) { console.error(e); }
};

const sendEventReminderEmail = async (toEmail, eventTitle, eventDate, eventTime) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST', headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
                sender: { name: 'TaskFlow', email: 'taskflowappbysidd@gmail.com' }, to: [{ email: toEmail }],
                subject: `Reminder: ${eventTitle} is tomorrow!`,
                htmlContent: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;"><h2 style="color: #00E5CC;">Event Reminder</h2><p>This is a reminder for your upcoming event:</p><div style="font-size: 18px; font-weight: bold; color: #00E5CC; padding: 16px; background: #f1f5f9; border-radius: 8px; margin: 16px 0;">"${eventTitle}"</div><p>Date: ${eventDate}<br>Time: ${eventTime || 'All Day'}</p></div>`
            })
        });
    } catch (e) { console.error(e); }
};

module.exports = {
    sendOtpEmail,
    sendTaskAssignedEmail,
    sendTaskRefusedEmail,
    sendTaskApprovedEmail,
    sendTaskRejectedEmail,
    sendTaskPendingApprovalEmail,
    sendEventReminderEmail
};
