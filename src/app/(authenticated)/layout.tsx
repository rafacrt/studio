
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Search, Heart, Briefcase, MessageSquare, CircleUser } from 'lucide-react'; // Updated icons
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth(); // Removed isAdmin as it's not used here
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
  
  // Airbnb-style bottom navigation items
  const navItems = [
    { href: '/explore', label: 'Explorar', icon: Search },
    { href: '/favorites', label: 'Favoritos', icon: Heart }, // Assuming /favorites route
    { href: '/trips', label: 'Viagens', icon: Briefcase },     // Assuming /trips route
    { href: '/messages', label: 'Mensagens', icon: MessageSquare }, // Assuming /messages route
    { href: '/profile', label: 'Perfil', icon: CircleUser },
  ];
  
  const airbnbPrimaryColor = "hsl(var(--airbnb-primary))"; // Using the CSS variable

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20 md:pb-0"> 
        {children}
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/explore" && pathname.startsWith("/room/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center text-center p-1 rounded-md w-1/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  isActive ? `text-[${airbnbPrimaryColor}]` : "text-muted-foreground hover:text-foreground"
                )}
                style={isActive ? { color: airbnbPrimaryColor } : {}}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? `text-[${airbnbPrimaryColor}]` : "")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
