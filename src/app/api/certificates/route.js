import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function GET() {
  try {
    await initDb();
    const [rows] = await pool.query(`SELECT * FROM certificates ORDER BY sort_order ASC, id ASC`);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const body = await request.json();
    const { title, img_src, link, sort_order } = body;

    if (!title || !img_src) {
      return NextResponse.json({ error: 'Judul dan Gambar certificate wajib diisi' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO certificates (title, img_src, link, sort_order) 
       VALUES (?, ?, ?, ?)`,
      [
        title,
        img_src,
        link || '#',
        sort_order !== undefined ? Number(sort_order) : 0,
      ]
    );

    const [created] = await pool.query(`SELECT * FROM certificates WHERE id = ?`, [result.insertId]);
    return NextResponse.json({ success: true, data: created[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating certificate:', err);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}
