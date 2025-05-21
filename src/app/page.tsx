
// Esta página será agora gerenciada pelo middleware.
// Se autenticado, será redirecionado para /dashboard.
// Se não autenticado, será redirecionado para /login.
// Podemos manter um conteúdo simples aqui ou um redirect explícito,
// mas o middleware já cuida do fluxo principal.

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth'; // Importe sua função de sessão

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
  // O código acima é um fallback, o middleware deve lidar com isso antes.
  // Retornar null ou um componente de loading simples também é uma opção.
  return null;
}
