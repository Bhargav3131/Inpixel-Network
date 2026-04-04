import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { rows } = await sql`
      SELECT * FROM submissions 
      ORDER BY created_at DESC
    `;

    res.status(200).json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
