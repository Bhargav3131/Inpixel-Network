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
    try {
      const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      
      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        },
        body: JSON.stringify({ category: randomCategory })
      });

      const data = await response.json();
      results.push({ attempt: i + 1, category: randomCategory, result: data });
      
      if (i < MAX_POSTS - 1) {
        await delay(3000);
      }
    } catch (error) {
      console.error(`Error generating post ${i + 1}:`, error);
      results.push({ attempt: i + 1, error: error.message });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Cron completed`,
    summary: results
  });
};
