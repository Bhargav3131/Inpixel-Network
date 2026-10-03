const CATEGORIES = [
  "digital marketing tips", "meta ads strategies", "social media growth",
  "web development trends", "AI in marketing", "SEO tips",
  "business growth", "branding", "content marketing", "e-commerce tips"
];

const delay = (ms) => new Promise(res => setTimeout(res, ms));

module.exports = async function (req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const host = req.headers.host || 'inpixelnetwork.in';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const generateUrl = `${protocol}://${host}/api/blog/generate`;

  let results = [];
  const MAX_POSTS = 5;

  for (let i = 0; i < MAX_POSTS; i++) {
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    let success = false;
    let attempts = 0;
    const MAX_RETRIES = 3;

    while (!success && attempts < MAX_RETRIES) {
      attempts++;
      try {
        const response = await fetch(generateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          },
          body: JSON.stringify({ category: randomCategory })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          results.push({ post: i + 1, status: 'success', category: randomCategory, title: data.title });
          success = true;
        } else {
          console.warn(`Post ${i + 1} attempt ${attempts} failed:`, data.message);
          if (attempts < MAX_RETRIES) {
            await delay(4000 * attempts); // Wait 4s, then 8s before retrying
          } else {
            results.push({ post: i + 1, status: 'failed', error: data.message });
          }
        }
      } catch (error) {
        console.error(`Post ${i + 1} attempt ${attempts} error:`, error.message);
        if (attempts < MAX_RETRIES) {
          await delay(4000 * attempts);
        } else {
          results.push({ post: i + 1, status: 'failed', error: error.message });
        }
      }
    }

    if (i < MAX_POSTS - 1) {
      await delay(2000); // 2 second pause before next post
    }
  }

  return res.status(200).json({
    success: true,
    message: `Cron completed`,
    summary: results
  });
};
