import type { ReactNode } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/lib/auth-actions'; // Server Action to get current user

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = await getCurrentUser();
  // Middleware should already protect this route, but as a safeguard:
  // if (!user) {
  //   redirect('/login'); 
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} FreelaOS Minimal. All rights reserved.
      </footer>
    </div>
  );
}
