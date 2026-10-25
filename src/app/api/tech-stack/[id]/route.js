import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { requireAuth } from '@/libs/authMiddleware';

export async function PUT(request, { params }) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { id } = await params;
    const body = await request.json();
    const { category, label, desc_text, img_src, progress, sort_order } = body;

    await pool.query(
      `UPDATE tech_stacks SET 
        category = COALESCE(?, category),
        label = COALESCE(?, label),
        desc_text = COALESCE(?, desc_text),
        img_src = COALESCE(?, img_src),
        progress = COALESCE(?, progress),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [category, label, desc_text, img_src, progress, sort_order, id]
    );

    const [updated] = await pool.query(`SELECT * FROM tech_stacks WHERE id = ?`, [id]);
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating tech stack:', err);
    return NextResponse.json({ error: 'Failed to update tech stack item' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { id } = await params;
    await pool.query(`DELETE FROM tech_stacks WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Item berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting tech stack:', err);
    return NextResponse.json({ error: 'Failed to delete tech stack item' }, { status: 500 });
  }
}
