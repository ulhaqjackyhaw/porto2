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
    const { title, img_src, link, sort_order } = body;

    await pool.query(
      `UPDATE certificates SET 
        title = COALESCE(?, title),
        img_src = COALESCE(?, img_src),
        link = COALESCE(?, link),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [title, img_src, link, sort_order, id]
    );

    const [updated] = await pool.query(`SELECT * FROM certificates WHERE id = ?`, [id]);
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating certificate:', err);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { id } = await params;
    await pool.query(`DELETE FROM certificates WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Certificate berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting certificate:', err);
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}
