import type { ReactNode } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/lib/auth-actions'; 

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} FreelaOS Minimal. Todos os direitos reservados.
      </footer>
    </div>
  );
}
