import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function GET(request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = `SELECT * FROM tech_stacks`;
    const params = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY sort_order ASC, id ASC`;
    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching tech_stacks:', err);
    return NextResponse.json({ error: 'Failed to fetch tech stacks' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const body = await request.json();
    const { category, label, desc_text, img_src, progress, sort_order } = body;

    if (!category || !label || !img_src) {
      return NextResponse.json({ error: 'Kategori, Nama/Label, dan Gambar wajib diisi' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO tech_stacks (category, label, desc_text, img_src, progress, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category,
        label,
        desc_text || '',
        img_src,
        progress !== undefined ? Number(progress) : 50,
        sort_order !== undefined ? Number(sort_order) : 0,
      ]
    );

    const [created] = await pool.query(`SELECT * FROM tech_stacks WHERE id = ?`, [result.insertId]);
    return NextResponse.json({ success: true, data: created[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating tech stack:', err);
    return NextResponse.json({ error: 'Failed to create tech stack item' }, { status: 500 });
  }
}
