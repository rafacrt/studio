
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  // Directly redirect to dashboard as login is bypassed
  redirect('/dashboard');

  // This part will not be reached due to the redirect above,
  // but kept as a fallback display during the redirect process.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Inicializando FreelaOS...</p>
    </div>
  );
}
