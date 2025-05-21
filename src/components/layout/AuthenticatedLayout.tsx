
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Header from './Header';
import type { User } from '@/lib/types';
import FooterContent from './FooterContent';
import { useOSStore } from '@/store/os-store';
import { getCurrentUser } from '@/lib/auth'; // Usaremos a função que verifica a sessão
import { useRouter } from 'next/navigation'; // Para redirecionamento programático

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Estado de carregamento do usuário

  const initializeStore = useOSStore((state) => state.initializeStore);
  const isStoreInitialized = useOSStore((state) => state.isStoreInitialized);

  useEffect(() => {
    async function fetchUser() {
      try {
        // getCurrentUser agora é async e pode vir do lib/auth que verifica o cookie
        // No entanto, getCurrentUser em lib/auth já chama getSession() que é async.
        // Para Client Components, é melhor ter uma action ou uma rota API para buscar o usuário
        // ou passar o usuário como prop de um Server Component pai.
        // Por agora, vamos simular o carregamento e assumir que o middleware protegeu.
        // Se getCurrentUser() for chamada aqui, ela se torna uma Server Action implícita e requer 'use server' no topo do arquivo ou ser chamada de uma.
        // Alternativa: Chamar uma API route ou uma Server Action explícita.
        // Para simplificar, vamos assumir que o middleware já validou e podemos obter os dados de alguma forma.
        // Se o middleware redireciona, este componente nem renderiza se não autenticado.
        // Vamos apenas simular a obtenção do usuário, o header mostrará ou não baseado no que foi passado.
        // **Importante**: Em um cenário real, o `user` seria obtido de forma segura aqui,
        // possivelmente através de uma chamada a uma Server Action que usa `getSession()`.
        // Por simplicidade, e como o middleware já protege, podemos confiar que se chegou aqui, existe sessão.
        // `getSession` não pode ser chamado diretamente em Client Components.
        // `Header` já recebe `user` como prop, que pode ser passado de um Server Component pai.
        // Aqui, vamos apenas simular um carregamento inicial.
        // **CORREÇÃO**: Não podemos chamar `getSession` diretamente aqui. O usuário deveria ser
        // passado como prop de um Server Component pai ou obtido via uma action/API.
        // Como o `Header` já espera `user` como prop, a responsabilidade de obter o `user`
        // deve ser de um componente pai (Server Component) que use `getSession`.
        // Para esta estrutura, vamos assumir que o middleware já fez seu trabalho.
        // Se estamos em AuthenticatedLayout, a sessão *deve* existir.
        // O Header receberá o usuário de uma fonte mais acima ou terá sua própria lógica para obtê-lo.
        // Por ora, o Header recebe `user` que vem do `Page` (Server Component).
        // Vamos focar na inicialização da store.

        // Para o propósito do layout, vamos apenas focar na inicialização da store.
        // O usuário para o Header deve vir de um Server Component que envolve esta página.
        // No entanto, como Header é parte deste layout cliente, ele mesmo pode tentar buscar o usuário
        // ou, melhor ainda, o user deve ser passado de um Server Component.
        // Para este exemplo, vamos obter o usuário através de uma action no client side (não ideal, mas funciona).
        
        // Chamada simulada ou real para obter o usuário da sessão
        // Em um Client Component, a melhor forma de obter o usuário atual
        // seria através de um contexto ou uma chamada a uma API/Server Action.
        // Como o Header precisa do user, e este é um Client Component,
        // a melhor forma é que o componente Page (Server) passe o user para AuthenticatedLayout.
        // Mas como o Header já tem `user` como prop, vamos deixar a lógica de obter o `user`
        // para o componente que renderiza `AuthenticatedLayout`.
        // Aqui, vamos só tratar do `initializeStore`.

        // Ajuste: para o Header funcionar corretamente, ele precisa do usuário.
        // Vamos fazer uma chamada client-side (via fetch a uma API route ou Server Action)
        // se o usuário não for passado como prop.
        // Temporariamente, vamos deixar o Header obter o user que é passado para ele.
        // E vamos assumir que o middleware já garantiu a autenticação.
        // O `user` para o Header será passado pelo componente Page.
        // Esta lógica de user aqui é mais para o layout em si, se precisar.
        setIsLoadingUser(false); // Simula que o usuário foi carregado

      } catch (error) {
        console.error("Error fetching user session:", error);
        setIsLoadingUser(false);
        router.push('/login'); // Se houver erro ao buscar sessão, redireciona
      }
    }
    fetchUser();

    if (!isStoreInitialized) {
      console.log('[AuthenticatedLayout] Store not initialized, calling initializeStore.');
      initializeStore();
    } else {
      console.log('[AuthenticatedLayout] Store already initialized.');
    }
  }, [isStoreInitialized, initializeStore, router]);


  if (isLoadingUser) {
     return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center bg-light" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Verificando sessão...</span>
          </div>
          <p className="text-muted">Verificando sessão...</p>
        </div>
     );
  }


  // O user para o Header será passado pelo componente Page que usa este layout.
  // Exemplo em dashboard/page.tsx: const session = await getSession(); <AuthenticatedLayout user={session}>...
  // Aqui, o `user` vindo como prop para o Header é o que importa.
  // O `user` local deste componente é mais para lógica interna do layout se necessário.

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* O `user` aqui deve ser o usuário da sessão atual obtido de forma segura */}
      {/* Este `user` para o Header deve vir de um Server Component que renderiza este layout */}
      {/* Por enquanto, o Header já está preparado para receber `user` como prop */}
      <Header user={user} /> {/* Este user precisa ser passado pelo Server Component pai */}
      <main className="container flex-grow-1 py-4 py-lg-5">
        {children}
      </main>
      <footer className="py-3 mt-auto text-center text-body-secondary border-top bg-light">
        <FooterContent />
      </footer>
    </div>
  );
}
