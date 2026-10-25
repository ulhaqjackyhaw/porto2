import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function GET() {
  try {
    await initDb();
    const [rows] = await pool.query(`SELECT * FROM contacts ORDER BY sort_order ASC, id ASC`);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const body = await request.json();
    const { platform, label, href, sort_order, is_active } = body;

    if (!platform || !label || !href) {
      return NextResponse.json({ error: 'Platform, Label, dan URL wajib diisi' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO contacts (platform, label, href, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        platform.toLowerCase(),
        label,
        href,
        sort_order !== undefined ? Number(sort_order) : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );

    const [created] = await pool.query(`SELECT * FROM contacts WHERE id = ?`, [result.insertId]);
    return NextResponse.json({ success: true, data: created[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating contact:', err);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
