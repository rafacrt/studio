
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react'; // Import useEffect
import Header from './Header';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';
import FooterContent from './FooterContent';
import { useOSStore } from '@/store/os-store'; // Import the store

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user: User | null = getCurrentUser();
  const initializeStore = useOSStore((state) => state.initializeStore);
  const isStoreInitialized = useOSStore((state) => state.isStoreInitialized);

  useEffect(() => {
    if (!isStoreInitialized) {
      console.log('[AuthenticatedLayout] Store not initialized, calling initializeStore.');
      initializeStore();
    } else {
      console.log('[AuthenticatedLayout] Store already initialized.');
    }
  }, [isStoreInitialized, initializeStore]);

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

