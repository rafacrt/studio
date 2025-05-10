
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const cookieStore = cookies();
  const currentUserToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!currentUserToken) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Inicializando FreelaOS...</p>
    </div>
  );
}
