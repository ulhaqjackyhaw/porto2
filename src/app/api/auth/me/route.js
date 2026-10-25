import { NextResponse } from 'next/server';
import { getSessionUser } from '@/libs/authMiddleware';

export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}
