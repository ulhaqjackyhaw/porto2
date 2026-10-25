import { NextResponse } from 'next/server';
import { requireAuth } from '@/libs/authMiddleware';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const origName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(origName).toLowerCase();
    const baseName = path.basename(origName, ext);
    const uniqueFileName = `${Date.now()}-${baseName}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.name,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 });
  }
}
