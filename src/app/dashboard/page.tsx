
// Make it a server component for this test
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  // This page is now a Server Component.
  // AuthenticatedLayout will handle fetching the user.

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel de Controle Simplificado</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Esta é uma versão de teste da página do painel.
          </p>
        </header>
        
        <section className="bg-card border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-3">Diagnóstico</h2>
          <p className="text-card-foreground mb-4">
            Se você está vendo esta mensagem, o layout autenticado básico e o carregamento de usuário mock (dentro do AuthenticatedLayout) 
            estão funcionando corretamente para a rota do painel.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            O problema original ("Error reaching server") provavelmente reside nos componentes ou na lógica de estado que foram removidos 
            temporariamente desta página. Especificamente, a lógica com `useState`, `useEffect`, `isClient`, `showAnimation`, 
            `PostLoginAnimation`, ou `OSGrid` na versão anterior do `DashboardPage` (que era um Client Component) 
            pode ter introduzido o erro durante o SSR ou hidratação.
          </p>
          <Link href="/" passHref>
            <Button variant="outline">Voltar para Página Inicial de Teste</Button>
          </Link>
        </section>

        <section className="mt-8 bg-card border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-3">Próximos Passos Sugeridos:</h2>
            <ul className="list-disc list-inside text-card-foreground space-y-2">
                <li>Se esta página funcionar, reintroduza gradualmente os componentes removidos (`PostLoginAnimation`, `OSGrid`) e a lógica de estado (`isClient`, `showAnimation`) na página do painel (voltando a ser um Client Component) para identificar qual parte específica está causando o erro no servidor.</li>
                <li>Verifique os logs do servidor Next.js (no terminal onde `npm run dev` está executando) para mensagens de erro mais detalhadas quando o problema original ocorre.</li>
                <li>Certifique-se de que todos os componentes que usam hooks do React (useState, useEffect, etc.) ou APIs do navegador (sessionStorage, localStorage) sejam Client Components (`'use client'`) e que o acesso a APIs do navegador esteja dentro de `useEffect` ou devidamente protegido para não executar no servidor.</li>
            </ul>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
