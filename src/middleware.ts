import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/get-started',
    '/get-started/:path*',
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

  // 2. Client Dashboard & Onboarding Protection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/get-started')) {
    const sessionCookie = req.cookies.get('kuiro_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
