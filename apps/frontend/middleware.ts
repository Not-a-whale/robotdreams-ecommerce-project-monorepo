import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProfileRoute =
    pathname === '/profile' || pathname.startsWith('/profile/');

  if (!isProfileRoute) {
    return NextResponse.next();
  }

  const session = req.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
