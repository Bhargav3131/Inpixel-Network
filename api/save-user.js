import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id         SERIAL PRIMARY KEY,
        name       TEXT,
        phone      TEXT,
        email      TEXT,
        services   TEXT,
        budget     TEXT,
        timeline   TEXT,
        business   TEXT,
        message    TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const { name, phone, email, services, budget, timeline, business, message } = req.body;

    // services is an array — convert to string for storage
    const servicesStr = Array.isArray(services) ? services.join(', ') : services;

    await sql`
      INSERT INTO submissions (name, phone, email, services, budget, timeline, business, message)
      VALUES (${name}, ${phone}, ${email}, ${servicesStr}, ${budget}, ${timeline}, ${business}, ${message})
    `;

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}