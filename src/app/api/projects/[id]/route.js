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
    const { title, category, tags, img_src, project_link, sort_order } = body;

    await pool.query(
      `UPDATE projects SET 
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        img_src = COALESCE(?, img_src),
        project_link = COALESCE(?, project_link),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [title, category, tags, img_src, project_link, sort_order, id]
    );

    const [updated] = await pool.query(`SELECT * FROM projects WHERE id = ?`, [id]);
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    await initDb();
    const { id } = await params;
    await pool.query(`DELETE FROM projects WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Project berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
