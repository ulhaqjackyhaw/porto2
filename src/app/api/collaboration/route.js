import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function GET() {
  try {
    await initDb();
    const [rows] = await pool.query(`SELECT * FROM collaboration_settings WHERE id = 1 LIMIT 1`);
    if (rows.length === 0) {
      return NextResponse.json({
        title: 'Contact me for collaboration',
        description: 'I am always open to learning and collaborating on challenging projects!',
      });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Error fetching collaboration settings:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { title, description } = await request.json();

    await pool.query(
      `UPDATE collaboration_settings SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description)
      WHERE id = 1`,
      [title, description]
    );

    const [updated] = await pool.query(`SELECT * FROM collaboration_settings WHERE id = 1 LIMIT 1`);
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating collaboration settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
