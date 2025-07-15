
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/packages/types';
import { useToast } from '@/web/hooks/use-toast';
import { mockUser, mockAdminUser } from '@/packages/lib/auth-mocks'; // Usaremos os mocks

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string) => Promise<boolean>;
  adminLogin: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoadingAuth: boolean;
  isAnimatingLogin: boolean;
  isPageLoading: boolean; 
  startPageLoading: () => void; 
  finishPageLoading: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Tenta carregar o usuário "mockado" do localStorage
    const localUser = localStorage.getItem('mockUser');
    if (localUser) {
      setUser(JSON.parse(localUser));
    }
    setIsLoadingAuth(false);
  }, []);

  const performLoginInternal = async (email: string, forAdmin: boolean): Promise<boolean> => {
    setIsAnimatingLogin(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula a chamada de rede

    let foundUser: User | null = null;

    if (email.toLowerCase() === mockAdminUser.email.toLowerCase()) {
        foundUser = mockAdminUser;
    } else if (email.toLowerCase() === mockUser.email.toLowerCase()) {
        foundUser = mockUser;
    }

    if (!foundUser) {
        toast({ title: "Erro de Login", description: "Usuário não encontrado.", variant: "destructive" });
        setIsAnimatingLogin(false);
        return false;
    }

    if (forAdmin && !foundUser.isAdmin) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar a área administrativa.", variant: "destructive" });
        setIsAnimatingLogin(false);
        return false;
    }

    setUser(foundUser);
    localStorage.setItem('mockUser', JSON.stringify(foundUser));

    await new Promise(resolve => setTimeout(resolve, 1500)); // Animação de boas-vindas
    
    if (foundUser.isAdmin) {
        router.push('/admin');
    } else {
        router.push('/explore');
    }

    setIsAnimatingLogin(false);
    return true;
  };

  const login = async (email: string): Promise<boolean> => {
      return performLoginInternal(email, false);
  };

  const adminLogin = async (email: string): Promise<boolean> => {
      return performLoginInternal(email, true);
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    router.push('/login?message=Logout realizado com sucesso');
  }, [router]);

  const startPageLoading = useCallback(() => setIsPageLoading(true), []);
  const finishPageLoading = useCallback(() => setIsPageLoading(false), []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      user,
      login,
      adminLogin,
      logout,
      isLoadingAuth,
      isAnimatingLogin,
      isPageLoading,      
      startPageLoading,   
      finishPageLoading   
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export { AuthContext };
