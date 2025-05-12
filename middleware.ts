
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid logging for static assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  console.log(`[Middleware] Processing request for path: ${pathname}`);

  // Removed redirect from / to /dashboard.
  // Requests to '/' will now be handled by src/app/page.tsx.

  console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
