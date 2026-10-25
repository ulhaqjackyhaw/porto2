import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { NextResponse } from 'next/server';

export async function getSessionUser(request) {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get('porto_token')?.value;

  let token = tokenFromCookie;
  if (!token && request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
  }
  return null; // indicates authorized
}
