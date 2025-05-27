
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mockUser, mockAdminUser } from '@/lib/mock-data';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoadingAuth: boolean;
  isAnimatingLogin: boolean;
  isPageLoading: boolean; // Novo estado para loading de página
  startPageLoading: () => void; // Nova função
  finishPageLoading: () => void; // Nova função
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Inicializa o novo estado
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthState = async () => {
      setIsLoadingAuth(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const storedUser = localStorage.getItem('user');
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(storedIsAdmin);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Falha ao verificar estado de autenticação:", error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthState();
  }, []);

  const performLoginInternal = useCallback(async (isLoginAsAdmin: boolean, _email?: string, _password?: string): Promise<boolean> => {
    setIsAnimatingLogin(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const userToLogin = isLoginAsAdmin ? mockAdminUser : mockUser;
      setUser(userToLogin);
      setIsAuthenticated(true);
      setIsAdmin(isLoginAsAdmin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      localStorage.setItem('isAdmin', String(isLoginAsAdmin));

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsAnimatingLogin(false);
      return true;
    } catch (e) {
      console.error("Falha no login:", e);
      toast({ title: "Erro de Login", description: "Falha ao tentar fazer login.", variant: "destructive" });
      setIsAnimatingLogin(false);
      return false;
    }
  }, [toast]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const success = await performLoginInternal(false, email, password);
    if (success) {
      router.push('/explore');
    }
    return success;
  }, [performLoginInternal, router]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    const success = await performLoginInternal(true, email, password);
    if (success) {
      router.push('/admin');
    }
    return success;
  }, [performLoginInternal, router]);

  const logout = useCallback(() => {
    if(isAnimatingLogin) setIsAnimatingLogin(false);
    if(isPageLoading) setIsPageLoading(false); // Garante que o loading de página também seja resetado

    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    if(isLoadingAuth) setIsLoadingAuth(false);
    router.push('/login?message=Logout realizado com sucesso');
  }, [router, isAnimatingLogin, isLoadingAuth, isPageLoading]);

  const startPageLoading = useCallback(() => {
    setIsPageLoading(true);
  }, []);

  const finishPageLoading = useCallback(() => {
    setIsPageLoading(false);
  }, []);

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
      isPageLoading,      // Fornece o novo estado
      startPageLoading,   // Fornece a nova função
      finishPageLoading   // Fornece a nova função
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
