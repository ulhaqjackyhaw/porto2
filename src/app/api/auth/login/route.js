import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';
import { signToken } from '@/libs/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await initDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT id, username, password, name FROM users WHERE username = ? LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, name: user.name });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { id: user.id, username: user.username, name: user.name },
      token,
    });

    response.cookies.set('porto_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
