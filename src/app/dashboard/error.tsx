
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <h1 className="text-3xl font-bold text-destructive mb-4">Oops! Algo deu errado.</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Não foi possível carregar o painel de controle no momento.
      </p>
      <div className="bg-destructive/10 p-4 rounded-md mb-6 max-w-md w-full">
        <h3 className="text-md font-semibold text-destructive mb-2">Detalhes do Erro:</h3>
        <p className="text-sm text-destructive-foreground break-all">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-destructive-foreground mt-2">Digest: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="default"
          size="lg"
        >
          Tentar Novamente
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Voltar para Início</Link>
        </Button>
      </div>
    </div>
  );
}
