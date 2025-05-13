"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import { mockUser, mockAdminUser } from '@/lib/mock-data'; // mockUser and mockAdminUser are re-exported by mock-data
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthState = async () => {
      setIsLoadingAuth(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async check
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
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

    try {
      const userToLogin = isLoginAsAdmin ? mockAdminUser : mockUser;
      setUser(userToLogin);
      setIsAuthenticated(true);
      setIsAdmin(isLoginAsAdmin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      localStorage.setItem('isAdmin', String(isLoginAsAdmin));

      // Simulate animation duration for UX
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setIsAnimatingLogin(false); // Signal animation wrapper to start hiding
      return true; 
    } catch (e) {
      console.error("Falha no login:", e);
      toast({ title: "Erro de Login", description: "Falha ao tentar fazer login.", variant: "destructive" });
      setIsAnimatingLogin(false); // Signal hide on error as well
      return false; 
    }
  }, [toast]); // Removed mockAdminUser and mockUser from dependencies as they are stable imports

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
      router.push('/admin/dashboard');
    }
    return success;
  }, [performLoginInternal, router]);

  const logout = useCallback(() => {
    if(isAnimatingLogin) setIsAnimatingLogin(false); 
    
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    if(isLoadingAuth) setIsLoadingAuth(false); 
    router.push('/login?message=Logout realizado com sucesso');
  }, [router, isAnimatingLogin, isLoadingAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, adminLogin, logout, isLoadingAuth, isAnimatingLogin }}>
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
