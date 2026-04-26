import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { SERVER_BACKEND_URL } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.accessToken) {
    try {
      await fetch(`${SERVER_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
    } catch {
      // backend unreachable — still clear the local session
    }
  }

  const res = NextResponse.redirect(new URL('/', req.nextUrl));
  res.cookies.delete('session');
  return res;
}
