const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a generic OTP or notification email.
 * @param {string} to - Recipient email address
 * @param {string} otp - User's name or OTP
 */
const sendOtpEmail = async (to, otp) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('\n[MAIL WARNING]: SMTP_USER or SMTP_PASS is not set. Email NOT sent.');
        console.warn(`To: ${to} | OTP: ${otp}\n`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"TaskFlow" <${process.env.SMTP_USER}>`,
            to,
            subject: 'TaskFlow — Email Verification',
            text: `Your TaskFlow verification OTP is: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`,
            html: `
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
            `,
        });
    } catch (error) {
        console.error('[Nodemailer Error]:', error);
        throw error;
    }
};

module.exports = { sendOtpEmail };

