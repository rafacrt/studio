
// import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Temporarily removed
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    // <AuthenticatedLayout> // Temporarily removed
      <div className="flex flex-col items-center justify-center min-h-screen flex-1 py-10 text-center p-4">
        <h1 className="text-3xl font-bold mb-4">Página Inicial de Teste (Simplificada)</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Se você está vendo esta mensagem, a rota principal (/) está funcionando.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Clique no botão abaixo para tentar acessar o painel de controle.
        </p>
        
        <Link href="/dashboard" passHref>
          <Button size="lg">
            Ir para o Painel de Controle
          </Button>
        </Link>

        <Loader2 className="mt-12 h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Simulando carregamento da página inicial...</p>
      </div>
    // </AuthenticatedLayout> // Temporarily removed
  );
}
