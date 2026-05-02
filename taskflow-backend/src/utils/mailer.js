/**
 * mailer.js — Email delivery utility.
 *
 * Priority:
 *   1. Mailtrap API (MAILTRAP_API_KEY) — used for local dev & college demo
 *   2. Brevo API   (BREVO_API_KEY)     — used for cloud/production
 *
 * If neither key is set, emails are logged to console (non-fatal).
 */

const MAILTRAP_URL = 'https://send.api.mailtrap.io/api/send';
const BREVO_URL    = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME  = 'TaskFlow';
const SENDER_EMAIL = 'hello@demomailtrap.com'; // Mailtrap sandbox sender

/**
 * Internal: build and send an email via Mailtrap or Brevo.
 * Falls back to console warning if no key is configured.
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
    // ── Mailtrap (preferred for dev / college demo) ────────────────────────────
    if (process.env.MAILTRAP_API_KEY) {
        const res = await fetch(MAILTRAP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Token': process.env.MAILTRAP_API_KEY,
            },
            body: JSON.stringify({
                from:    { name: SENDER_NAME, email: SENDER_EMAIL },
                to:      [{ email: to }],
                subject,
                html:    htmlContent,
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Mailtrap error: ${JSON.stringify(err)}`);
        }
        return;
    }

    // ── Brevo (production fallback) ────────────────────────────────────────────
    if (process.env.BREVO_API_KEY) {
        const res = await fetch(BREVO_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: 'taskflowappbysidd@gmail.com' },
                to: [{ email: to }],
                subject,
                htmlContent,
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Brevo error: ${JSON.stringify(err)}`);
        }
        return;
    }

    // ── No email service configured — log to console ───────────────────────────
    console.warn(`\n[MAIL] No API key set. Would have sent to: ${to}`);
    console.warn(`[MAIL] Subject: ${subject}`);
    console.warn(`[MAIL] Check console for OTP values above.\n`);
};

// ─── OTP / Verification Emails ────────────────────────────────────────────────

const sendOtpEmail = async (to, otp) => {
    await sendEmail({
        to,
        subject: 'TaskFlow — Email Verification',
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; background: #0f172a; border-radius: 12px;">
                <h2 style="color: #00E5CC; margin-top: 0;">TaskFlow</h2>
                <p style="font-size: 16px; color: #e2e8f0;">Your one-time verification code is:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #00E5CC;
                            padding: 20px; background: #1e293b; border-radius: 10px; text-align: center;
                            border: 1px solid #334155; margin: 16px 0;">
                    ${otp}
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
                    This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>.
                    Never share it with anyone.
                </p>
            </div>
        `,
    });
};

// ─── Task Emails ──────────────────────────────────────────────────────────────

const sendTaskAssignedEmail = async (toEmail, taskTitle, assignerName) => {
    await sendEmail({
        to: toEmail,
        subject: `New Task Assigned: "${taskTitle}"`,
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; background: #0f172a; border-radius: 12px;">
                <h2 style="color: #00E5CC; margin-top: 0;">New Task Assigned</h2>
                <p style="color: #e2e8f0;"><strong>${assignerName || 'Someone'}</strong> has assigned a new task to you:</p>
                <div style="font-size: 18px; font-weight: bold; color: #00E5CC; padding: 16px;
                            background: #1e293b; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
                    "${taskTitle}"
                </div>
                <p style="color: #94a3b8; font-size: 14px;">Log into TaskFlow to view details and get started.</p>
            </div>
        `,
    }).catch(console.error);
};

const sendTaskRefusedEmail = async (toEmail, taskTitle, assigneeName) => {
    await sendEmail({
        to: toEmail,
        subject: `Task Refused: "${taskTitle}"`,
        htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;border-radius:12px;">
            <h2 style="color:#FF5252;margin-top:0;">Task Refused</h2>
            <p style="color:#e2e8f0;"><strong>${assigneeName}</strong> has refused the task "<strong>${taskTitle}</strong>". Log in to reassign or modify it.</p>
        </div>`,
    }).catch(console.error);
};

const sendTaskApprovedEmail = async (toEmail, taskTitle) => {
    await sendEmail({
        to: toEmail,
        subject: `Task Approved ✓: "${taskTitle}"`,
        htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;border-radius:12px;">
            <h2 style="color:#28c840;margin-top:0;">Task Approved</h2>
            <p style="color:#e2e8f0;">Your completion of "<strong>${taskTitle}</strong>" has been approved and marked as done. Great work!</p>
        </div>`,
    }).catch(console.error);
};

const sendTaskRejectedEmail = async (toEmail, taskTitle) => {
    await sendEmail({
        to: toEmail,
        subject: `Task Completion Rejected: "${taskTitle}"`,
        htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;border-radius:12px;">
            <h2 style="color:#FF5252;margin-top:0;">Task Rejected</h2>
            <p style="color:#e2e8f0;">Your completion of "<strong>${taskTitle}</strong>" has been rejected. The task is active again — please review and resubmit.</p>
        </div>`,
    }).catch(console.error);
};

const sendTaskPendingApprovalEmail = async (toEmail, taskTitle, assigneeName) => {
    await sendEmail({
        to: toEmail,
        subject: `Approval Required: "${taskTitle}"`,
        htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;border-radius:12px;">
            <h2 style="color:#FF9800;margin-top:0;">Pending Approval</h2>
            <p style="color:#e2e8f0;"><strong>${assigneeName}</strong> has marked "<strong>${taskTitle}</strong>" as done. Log in to approve or reject their work.</p>
        </div>`,
    }).catch(console.error);
};

const sendEventReminderEmail = async (toEmail, eventTitle, eventDate, eventTime) => {
    await sendEmail({
        to: toEmail,
        subject: `Reminder: "${eventTitle}" is tomorrow!`,
        htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;border-radius:12px;">
            <h2 style="color:#00E5CC;margin-top:0;">Event Reminder</h2>
            <p style="color:#e2e8f0;">Your upcoming event:</p>
            <div style="font-size:18px;font-weight:bold;color:#00E5CC;padding:16px;background:#1e293b;border-radius:8px;margin:16px 0;">"${eventTitle}"</div>
            <p style="color:#94a3b8;">Date: ${eventDate}<br>Time: ${eventTime || 'All Day'}</p>
        </div>`,
    }).catch(console.error);
};

module.exports = {
    sendOtpEmail,
    sendTaskAssignedEmail,
    sendTaskRefusedEmail,
    sendTaskApprovedEmail,
    sendTaskRejectedEmail,
    sendTaskPendingApprovalEmail,
    sendEventReminderEmail,
};
