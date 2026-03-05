const { MailtrapClient } = require('mailtrap');

const client = new MailtrapClient({
    token: process.env.MAILTRAP_API_KEY || '',
});

/**
 * Send a 6-digit OTP email to the user for password reset.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendOtpEmail = async (to, otp) => {
    // Prevent crash if API key is not configured
    if (!process.env.MAILTRAP_API_KEY) {
        console.warn('\n[MAILTRAP WARNING]: MAILTRAP_API_KEY is not set. The following email was NOT sent:');
        console.warn(`To: ${to} | OTP: ${otp}\n`);
        return;
    }

    await client.send({
        from: {
            name: 'TaskFlow',
            email: process.env.MAIL_FROM || 'noreply@taskflow.app',
        },
        to: [{ email: to }],
        subject: 'TaskFlow — Password Reset OTP',
        text: `Your TaskFlow password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #6366f1;">TaskFlow — Password Reset</h2>
                <p>Your one-time password (OTP) is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6366f1; padding: 16px; background: #f1f5f9; border-radius: 8px; text-align: center;">
                    ${otp}
                </div>
                <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
                    This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
            </div>
        `,
    });
};

module.exports = { sendOtpEmail };
