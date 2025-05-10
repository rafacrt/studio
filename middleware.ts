import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const PROTECTED_ROUTES = ['/dashboard', '/os'];
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Avoid logging for static assets frequently requested by browser
  if (pathname.startsWith('/_next/') || pathname.includes('.')) { // Basic check for asset paths
    return NextResponse.next();
  }
  console.log(`[Middleware] Processing request for path: ${pathname}`);

  const currentUserToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  console.log(`[Middleware] Token from request.cookies ('${AUTH_COOKIE_NAME}'): ${currentUserToken ? currentUserToken.substring(0,20) + '...' : 'None'}`);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  console.log(`[Middleware] Path: ${pathname}, IsProtectedRoute: ${isProtectedRoute}, IsPublicRoute: ${isPublicRoute}, TokenPresent: ${!!currentUserToken}`);

  if (isProtectedRoute && !currentUserToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    console.log(`[Middleware] Redirecting to login (protected route, no token). From: ${pathname}, To: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute && currentUserToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    console.log(`[Middleware] Redirecting to dashboard (public route, token found). From: ${pathname}, To: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (pathname === '/' && currentUserToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    console.log(`[Middleware] Redirecting to dashboard (root path, token found). From: ${pathname}, To: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === '/' && !currentUserToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    console.log(`[Middleware] Redirecting to login (root path, no token). From: ${pathname}, To: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
