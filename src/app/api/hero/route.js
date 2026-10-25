import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function GET() {
  try {
    await initDb();
    const [rows] = await pool.query(`SELECT * FROM hero_settings WHERE id = 1 LIMIT 1`);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Error fetching hero:', err);
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const data = await request.json();
    const {
      available_text,
      title_prefix,
      title_name,
      title_role,
      cv_label,
      cv_url,
      connect_label,
      connect_link,
      banner_img,
      about_text,
    } = data;

    await pool.query(
      `UPDATE hero_settings SET 
        available_text = COALESCE(?, available_text),
        title_prefix = COALESCE(?, title_prefix),
        title_name = COALESCE(?, title_name),
        title_role = COALESCE(?, title_role),
        cv_label = COALESCE(?, cv_label),
        cv_url = COALESCE(?, cv_url),
        connect_label = COALESCE(?, connect_label),
        connect_link = COALESCE(?, connect_link),
        banner_img = COALESCE(?, banner_img),
        about_text = COALESCE(?, about_text)
      WHERE id = 1`,
      [
        available_text,
        title_prefix,
        title_name,
        title_role,
        cv_label,
        cv_url,
        connect_label,
        connect_link,
        banner_img,
        about_text,
      ]
    );

    const [updated] = await pool.query(`SELECT * FROM hero_settings WHERE id = 1 LIMIT 1`);
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating hero:', err);
    return NextResponse.json({ error: 'Failed to update hero settings' }, { status: 500 });
  }
}
