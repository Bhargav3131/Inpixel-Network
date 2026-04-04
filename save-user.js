import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        name,
        phone,
        email,
        services,
        budget,
        timeline,
        business,
        message
      } = req.body;

      await sql`
        INSERT INTO submissions 
        (name, phone, email, services, budget, timeline, business, message)
        VALUES 
        (${name}, ${phone}, ${email}, ${services}, ${budget}, ${timeline}, ${business}, ${message});
      `;

      res.status(200).json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  }
}