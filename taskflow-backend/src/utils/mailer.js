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

module.exports = { sendOtpEmail };

