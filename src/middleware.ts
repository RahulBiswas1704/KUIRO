import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Client Dashboard Protection
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = req.cookies.get('kuiro_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/get-started?mode=signin', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
