'use client';

import Link from 'next/link';
import { LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { logout as performLogout } from '@/lib/auth-actions'; 
import type { User } from '@/lib/types';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await performLogout();
      toast({
        title: 'Logout Realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      // Redirect is handled by server action or middleware
    } catch (error) {
      toast({
        title: 'Falha no Logout',
        description: 'Ocorreu um erro durante o logout. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9.75 2.75H4.75C3.64543 2.75 2.75 3.64543 2.75 4.75V9.75C2.75 10.8546 3.64543 11.75 4.75 11.75H9.75C10.8546 11.75 11.75 10.8546 11.75 9.75V4.75C11.75 3.64543 10.8546 2.75 9.75 2.75Z"></path><path d="M19.25 2.75H14.25C13.1454 2.75 12.25 3.64543 12.25 4.75V9.75C12.25 10.8546 13.1454 11.75 14.25 11.75H19.25C20.3546 11.75 21.25 10.8546 21.25 9.75V4.75C21.25 3.64543 20.3546 2.75 19.25 2.75Z"></path><path d="M9.75 12.25H4.75C3.64543 12.25 2.75 13.1454 2.75 14.25V19.25C2.75 20.3546 3.64543 21.25 4.75 21.25H9.75C10.8546 21.25 11.75 20.3546 11.75 19.25V14.25C11.75 13.1454 10.8546 12.25 9.75 12.25Z"></path><path d="M15.75 18.25H12.75V15.25H15.75V18.25Z"></path><path d="M18.25 15.75H15.75V12.75H18.25V15.75Z"></path><path d="M21.25 15.75H18.25V12.75H21.25V15.75Z"></path><path d="M21.25 18.25H18.25V15.25H21.25V18.25Z"></path><path d="M15.75 21.25H12.75V18.25H15.75V21.25Z"></path><path d="M18.25 21.25H15.75V18.25H18.25V21.25Z"></path><path d="M21.25 21.25H18.25V18.25H21.25V21.25Z"></path></svg>
          <span className="text-xl font-bold text-primary">FreelaOS Minimal</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Olá, <span className="font-medium text-foreground">{user.username}</span>
            </span>
             <UserCircle className="h-6 w-6 sm:hidden text-muted-foreground" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
