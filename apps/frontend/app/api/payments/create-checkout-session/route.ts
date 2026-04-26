import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateTokens } from '@/lib/session';
import { SERVER_BACKEND_URL } from '@/lib/constants';

const PAYMENTS_URL =
  process.env.PAYMENTS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ||
  'http://localhost:3003';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    ) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

async function getValidToken(session: Awaited<ReturnType<typeof getSession>>): Promise<string> {
  if (!session) throw new Error('No session');

  const { accessToken, refreshToken } = session;

  if (!isTokenExpired(accessToken)) return accessToken;

  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${SERVER_BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  await updateTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let token: string;
  try {
    token = await getValidToken(session);
  } catch {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const body = await req.json();

  const response = await fetch(`${PAYMENTS_URL}/sessions/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: text }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
