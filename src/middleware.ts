
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid logging for static assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  console.log(`[Middleware] Processing request for path: ${pathname}`);

  // Temporarily comment out the redirect from / to /dashboard.
  // This allows src/app/page.tsx to be rendered directly via the / path
  // for testing the navigation button on it.
  /*
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    console.log(`[Middleware] Redirecting from / to /dashboard (currently disabled for testing).`);
    return NextResponse.redirect(redirectUrl);
  }
  */
  
  // If specifically on /, allow it for now to show the test page.
  if (pathname === '/') {
    console.log('[Middleware] Allowing request to / (test home page).');
    return NextResponse.next();
  }

  console.log(`[Middleware] Allowing request to proceed for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
