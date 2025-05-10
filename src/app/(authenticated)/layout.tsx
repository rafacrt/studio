
"use client";

import { BottomNavigationBar } from '@/components/BottomNavigationBar';
import { Header } from '@/components/Header'; // Import Header
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {/* The main content needs padding-top to account for the sticky header's height (h-16 = 4rem) */}
      <main className="flex-grow pb-20 pt-16"> {/* Adjusted pt-16, pb-20 for bottom nav */}
        {children}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
