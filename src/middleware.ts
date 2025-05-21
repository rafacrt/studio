
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Usaremos getSession que já lê cookies

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Evitar processamento para assets estáticos e rotas de API
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Assume arquivos com extensões são assets estáticos
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing request for path: ${pathname}`);

  const session = await getSession(); // Verifica se há uma sessão ativa

  // Rotas públicas que não exigem autenticação
  const publicPaths = ['/login', '/register']; // Adicionar /register se existir

  // Se o usuário está tentando acessar uma rota pública
  if (publicPaths.includes(pathname)) {
    if (session) {
      // Se está autenticado e tenta acessar /login, redireciona para o dashboard
      console.log('[Middleware] User authenticated, redirecting from public auth page to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Se não está autenticado, permite acesso à página pública (login/register)
    console.log('[Middleware] User not authenticated, allowing access to public auth page:', pathname);
    return NextResponse.next();
  }

  // Para todas as outras rotas (protegidas)
  if (!session) {
    // Se não há sessão e a rota não é pública, redireciona para /login
    console.log('[Middleware] No session, redirecting to /login from protected route:', pathname);
    // Preserve o pathname original como query param para redirecionar de volta após o login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') { // Evita redirect loop se a home for protegida e o login for a home
        loginUrl.searchParams.set('redirectedFrom', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Se há sessão e a rota é protegida, permite o acesso
  console.log(`[Middleware] Session valid, allowing access to protected route: ${pathname}`);

  // Redireciona da raiz "/" para "/dashboard" se autenticado
  if (pathname === '/') {
    console.log('[Middleware] User authenticated, redirecting from / to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher garante que o middleware rode para caminhos relevantes
  // Exclui favicon.ico e assets estáticos/API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
