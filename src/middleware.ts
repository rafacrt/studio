
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid processing for static assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Assume files with extensions are static assets
   ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing request for path: ${pathname}`);

  // Allow access to the root path (landing page) explicitly
  if (pathname === '/') {
    console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
    return NextResponse.next();
  }

  // Redirect root path logic (currently commented out for landing page)
  /*
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    console.log(`[Middleware] Redirecting from / to /dashboard.`);
    return NextResponse.redirect(redirectUrl);
  }
  */

  // For any other path, allow it to proceed (assuming it's handled by other routes like /dashboard, /os/[id], etc.)
  // This will now handle /dashboard and other OS management routes directly.
  console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  // Adjust matcher to exclude API routes as well
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

