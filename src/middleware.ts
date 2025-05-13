
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
    // console.log(`[Middleware] Ignoring static/API asset: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing request for path: ${pathname}`);

  // Allow access to the root path (landing page) explicitly
  if (pathname === '/') {
    console.log(`[Middleware] Allowing request to proceed for root path: ${pathname}`);
    return NextResponse.next();
  }

  // For any other path, allow it to proceed.
  // This is important for /dashboard, /os/[id], etc.
  console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  // Matcher ensures middleware runs for relevant paths
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
