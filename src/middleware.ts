import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('sapori_admin_session')?.value;
  const isAuthenticated = Boolean(
    sessionCookie && sessionCookie.includes('authenticated_sapori_admin_session')
  );

  // 1. Admin Page Route Protection (Server-Side Gate)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Sensitive Admin API Route Protection
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/db-status'
  ) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
  }

  // 3. Prepare response with Security Headers
  const response = NextResponse.next();

  // Enforce HSTS (HTTP Strict Transport Security)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Prevent Clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict Powerful Browser Features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com" "https://*.razorpay.com")'
  );

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://checkout.razorpay.com https://api.razorpay.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.razorpay.com https://*.google.com https://*.googleapis.com https://*.gstatic.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://*.google-analytics.com https://*.analytics.google.com https://res.cloudinary.com https://*.mongodb.net;
    frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://www.google.com https://maps.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://api.razorpay.com;
    frame-ancestors 'self';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public images/assets
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
