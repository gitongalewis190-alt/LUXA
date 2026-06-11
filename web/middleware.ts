import { NextRequest, NextResponse } from 'next/server';

const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/create-project',
  '/cart',
  '/checkout',
  '/saved',
  '/settings',
  '/wallet',
];

const ADMIN_ROUTES = ['/admin'];

const AUTH_ONLY_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('luxa-session')?.value;
  const adminToken   = request.cookies.get('luxa-admin-signal')?.value;
  const isAuthenticated = Boolean(sessionToken);
  const isAdminSession  = Boolean(adminToken) && adminToken === process.env.ADMIN_SIGNAL_TOKEN;

  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAdminSession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options',        'DENY');
  response.headers.set('X-Content-Type-Options',  'nosniff');
  response.headers.set('Referrer-Policy',         'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',      'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|icons|images|fonts).*)',
  ],
};
