const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Can be configured for other services
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 [Email Service Mock] Email not configured. Skipping sending.');
            return;
        }
        console.warn('⚠️ Email credentials missing in environment variables');
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Zaykaa" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        // Don't throw to prevent blocking the auth flow, just log it
    }
};

const sendOTP = async (email, otp, name = 'Valued Customer') => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fcfcfc; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e25822; }
            .logo { font-size: 28px; font-weight: bold; color: #e25822; text-decoration: none; }
            .content { padding: 30px 0; text-align: center; }
            .otp-box { background-color: #fff5f2; border: 1px dashed #e25822; border-radius: 8px; font-size: 32px; font-weight: bold; color: #e25822; letter-spacing: 5px; padding: 15px; margin: 20px 0; display: inline-block; }
            .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Zaykaa</div>
                <p>Taste the Tradition</p>
            </div>
            <div class="content">
                <h2>Authentication Verification</h2>
                <p>Hello ${name},</p>
                <p>Use the One-Time Password (OTP) below to complete your login securely.</p>
                
                <div class="otp-box">${otp}</div>
                
                <p>This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Zaykaa. All rights reserved.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail(email, 'Your Zaykaa Login OTP', html);
};

module.exports = {
    sendOTP
};
