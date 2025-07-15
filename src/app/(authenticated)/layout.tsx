
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/packages/auth/AuthContext';
import { Loader2, Search, Briefcase, MessageSquare, CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingAuth } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login?message=Faça login para continuar');
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const navItems = [
    { href: '/explore', label: 'Explorar', icon: Search },
    { href: '/reservations', label: 'Viagens', icon: Briefcase },
    { href: '/messages', label: 'Mensagens', icon: MessageSquare },
    { href: '/profile', label: 'Perfil', icon: CircleUser },
  ];
  
  const activeColor = "hsl(var(--airbnb-primary))"; 

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20 md:pb-0"> 
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center text-center p-1 rounded-md w-1/4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  isActive ? `text-[${activeColor}]` : "text-muted-foreground hover:text-foreground"
                )}
                style={isActive ? { color: activeColor } : {}}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? `text-[${activeColor}]` : "")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
