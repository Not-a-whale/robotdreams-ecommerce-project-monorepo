import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.nextUrl));

  res.cookies.delete('session');

  return res;
}
