
"use client";

import Link from 'next/link';
import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    triggerHapticFeedback();
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/explore" className="flex items-center" onClick={() => triggerHapticFeedback(5)}>
          <AppLogo className="h-8 w-auto" />
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <span className="text-sm text-foreground hidden sm:inline">
              Bem-vindo(a), {user.name.split(' ')[0]}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm px-2 sm:px-3">
            <LogOut className="mr-1 h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
