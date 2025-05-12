
'use client';

import type { ReactNode } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';
import FooterContent from './FooterContent';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user: User | null = getCurrentUser();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} />
      {/* Use Bootstrap container for main content */}
      <main className="container flex-grow-1 py-4 py-lg-5">
        {children}
      </main>
      {/* Use Bootstrap footer classes */}
      <footer className="py-3 mt-auto text-center text-body-secondary border-top bg-light">
        <FooterContent />
      </footer>
    </div>
  );
}
