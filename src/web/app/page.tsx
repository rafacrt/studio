
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/packages/auth/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoadingAuth, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated) {
        if (isAdmin) {
            router.replace('/admin'); // Updated redirect to /admin
        } else {
            router.replace('/explore');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoadingAuth, isAdmin, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-3 text-foreground">Carregando...</p>
    </div>
  );
}
