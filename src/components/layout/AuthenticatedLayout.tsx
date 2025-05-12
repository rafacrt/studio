
'use client'; // Add 'use client' because Header and FooterContent are client components

import type { ReactNode } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/lib/auth'; // Import remains the same
import type { User } from '@/lib/types'; // Ensure User is imported as a type
import FooterContent from './FooterContent'; 

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // getCurrentUser is synchronous, call it directly. Explicitly type the user variable.
  const user: User | null = getCurrentUser(); 

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} /> {/* Pass the user object */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <FooterContent />
      </footer>
    </div>
  );
}
