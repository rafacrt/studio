"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/packages/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/web/components/ui/sidebar';
import { AdminNavigation } from '@/web/components/AdminNavigation';
import { Button } from '@/web/components/ui/button';
import { PanelLeft } from 'lucide-react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoadingAuth, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        router.replace('/login?message=Faça login para continuar');
      } else if (!isAdmin) {
        router.replace('/explore?message=Acesso negado');
      }
    }
  }, [isAuthenticated, isAdmin, isLoadingAuth, router]);

  if (isLoadingAuth || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon">
            <AdminNavigation />
        </Sidebar>
        <SidebarInset>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <div className="md:hidden mb-4">
                    <SidebarTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <PanelLeft/>
                        </Button>
                    </SidebarTrigger>
                 </div>
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
