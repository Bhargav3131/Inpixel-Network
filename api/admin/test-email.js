const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { to } = req.body || {};
  const recipient = to || ADMIN_EMAIL;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: 'GMAIL_USER or GMAIL_APP_PASSWORD environment variables are not configured in Vercel.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Verify credentials with Gmail server first
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Inpixel Network" <${process.env.GMAIL_USER}>`,
      to: recipient,
      subject: 'Test Email — Inpixel Email System Configured Successfully',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #060608; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(240,165,0,0.2);">
          <div style="background: linear-gradient(135deg, #f0a500 0%, #d4920a 100%); padding: 28px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; color: #060608; font-weight: 800;">Email System Connected ✓</h1>
          </div>
          <div style="padding: 28px;">
            <p style="color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.6;">
              Congratulations! Your Gmail App Password is configured correctly on Vercel.
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.6;">
              Whenever a customer pays for any service (Websites, Meta Ads, SMM, AI Videos, or Quotation Software), they will automatically receive their branded HTML receipt from <strong>${process.env.GMAIL_USER}</strong>.
            </p>
            <div style="margin-top: 24px; padding: 14px; background: rgba(240,165,0,0.08); border-radius: 6px; text-align: center;">
              <span style="color: #f0a500; font-family: monospace; font-size: 13px;">Status: LIVE & OPERATIONAL</span>
            </div>
          </div>
          <div style="padding: 16px; background: rgba(255,255,255,0.02); text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <span style="color: rgba(255,255,255,0.3); font-size: 11px;">Inpixel Network · Automated Receipt System</span>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${recipient}!`,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Test email failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Check your Gmail credentials.',
      error: error.message
    });
  }
};
