'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export type Session = {
  user: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET_KEY);

export async function createSession(payload: Session) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  const store = await cookies();
  store.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}


export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  if (!cookie) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as Session;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  await cookieStore.delete('session');
}
