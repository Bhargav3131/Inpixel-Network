const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

const DEFAULT_PRICES = {
  'socialmedia': 99900,
  'webdevelopment-starter': 299900,
  'webdevelopment-pro': 599900,
  'aivideos': 99900,
  'metaads': 299900,
  'quotation': 299900
};

const DEFAULT_EMAIL_SETTINGS = {
  subject: 'Payment Confirmed — {service} | Inpixel Network',
  heading: 'Payment Successful ✓',
  subheading: 'Thank you for choosing Inpixel Network',
  message: 'Our team will reach out to you shortly to get started.',
  contactEmail: 'supportinpixelnetwork@gmail.com'
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function verifyAdmin(req, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const user = await verifyAdmin(req, supabase);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // ── Handle Pricing action ──
    if (req.query && req.query.action === 'pricing') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'pricing').maybeSingle();
        if (error || !data || !data.value) {
          return res.status(200).json({ success: true, data: DEFAULT_PRICES });
        }
        return res.status(200).json({ success: true, data: data.value });
      }

      if (req.method === 'POST') {
        const { prices } = req.body || {};
        if (!prices || typeof prices !== 'object') {
          return res.status(400).json({ success: false, message: 'Invalid pricing payload' });
        }

        const { error } = await supabase.from('settings').upsert({
          key: 'pricing',
          value: prices,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to save to settings table: ' + (error.message || 'Table may not exist')
          });
        }

        return res.status(200).json({ success: true, message: 'Pricing updated successfully' });
      }

      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // ── Handle Email Settings action ──
    if (req.query && req.query.action === 'email-settings') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'email_settings').maybeSingle();
        if (error || !data || !data.value) {
          return res.status(200).json({ success: true, data: DEFAULT_EMAIL_SETTINGS });
        }
        return res.status(200).json({ success: true, data: { ...DEFAULT_EMAIL_SETTINGS, ...data.value } });
      }

      if (req.method === 'POST') {
        const { settings } = req.body || {};
        if (!settings || typeof settings !== 'object') {
          return res.status(400).json({ success: false, message: 'Invalid settings payload' });
        }

        const { error } = await supabase.from('settings').upsert({
          key: 'email_settings',
          value: settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to save email settings: ' + (error.message || 'Table may not exist')
          });
        }

        return res.status(200).json({ success: true, message: 'Email settings saved successfully' });
      }

      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // ── Handle Send Preview/Test Email action ──
    if (req.query && req.query.action === 'test-custom-email') {
      if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

      const { settings } = req.body || {};
      const activeSettings = { ...DEFAULT_EMAIL_SETTINGS, ...(settings || {}) };

      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(500).json({ success: false, message: 'GMAIL_USER or GMAIL_APP_PASSWORD not set in Vercel' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      const subject = activeSettings.subject.replace(/\{service\}/g, 'Social Media Management').replace(/\{amount\}/g, '₹999');
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060608; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(240,165,0,0.2);">
          <div style="background: linear-gradient(135deg, #f0a500 0%, #d4920a 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #060608; font-weight: 800;">${activeSettings.heading}</h1>
            <p style="margin: 8px 0 0; color: rgba(6,6,8,0.7); font-size: 14px;">${activeSettings.subheading}</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #f0a500; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px;">[TEST PREVIEW] Payment Receipt</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 600; font-size: 14px;">John Doe (Sample)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Service</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 600; font-size: 14px;">Social Media Management</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Amount Paid</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 700; color: #22c55e; font-size: 14px;">₹999</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Payment ID</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.7);">pay_sample12345</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: rgba(255,255,255,0.5); font-size: 14px;">Order ID</td>
                <td style="padding: 12px 0; text-align: right; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.7);">order_sample67890</td>
              </tr>
            </table>
            <div style="margin-top: 28px; padding: 20px; background: rgba(240,165,0,0.08); border: 1px solid rgba(240,165,0,0.2); border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; white-space: pre-line;">
                ${activeSettings.message}
              </p>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.5); font-size: 13px;">
                For any queries, contact us at <a href="mailto:${activeSettings.contactEmail}" style="color: #f0a500;">${activeSettings.contactEmail}</a>
              </p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Inpixel Network" <${process.env.GMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: '[TEST PREVIEW] ' + subject,
        html
      });

      return res.status(200).json({ success: true, message: 'Test email sent to ' + ADMIN_EMAIL });
    }

    // ── Default: GET payments list ──
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Payments endpoint error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
