
import type { ReactNode } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/lib/auth'; // Import remains the same
import FooterContent from './FooterContent'; 

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // Calls the simplified getCurrentUser from lib/auth.ts directly.
  // This function no longer uses cookies() but returns a mock user.
  const user = await getCurrentUser(); 

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <FooterContent />
      </footer>
    </div>
  );
}
