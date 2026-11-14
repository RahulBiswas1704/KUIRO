import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Operator Admin Center Protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminClearance = req.cookies.get('kuiro_admin_clearance')?.value;
    if (!adminClearance) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Client Dashboard Protection
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = req.cookies.get('kuiro_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
