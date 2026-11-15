import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Operator Admin Center Protection (Requires kuiro_mgmt_token)
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('kuiro_mgmt_token')?.value;

    if (pathname === '/admin/login') {
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    if (!adminToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Client Dashboard Protection
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
