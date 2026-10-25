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
    const { platform, label, href, sort_order, is_active } = body;

    await pool.query(
      `UPDATE contacts SET 
        platform = COALESCE(?, platform),
        label = COALESCE(?, label),
        href = COALESCE(?, href),
        sort_order = COALESCE(?, sort_order),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        platform ? platform.toLowerCase() : null,
        label,
        href,
        sort_order,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    const [updated] = await pool.query(`SELECT * FROM contacts WHERE id = ?`, [id]);
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating contact:', err);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { id } = await params;
    await pool.query(`DELETE FROM contacts WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Contact berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
