"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
        // Simulate checking auth status (e.g., from localStorage)
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
        console.error("Auth check failed:", error);
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
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      const userToLogin = isLoginAsAdmin ? mockAdminUser : mockUser;
      setUser(userToLogin);
      setIsAuthenticated(true);
      setIsAdmin(isLoginAsAdmin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      localStorage.setItem('isAdmin', String(isLoginAsAdmin));

      // Simulate animation duration for UX
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setIsAnimatingLogin(false);
      return true; // Indicate success
    } catch (e) {
      console.error("Login failed", e);
      toast({ title: "Erro de Login", description: "Falha ao tentar fazer login.", variant: "destructive" });
      setIsAnimatingLogin(false);
      return false; // Indicate failure
    }
  }, [toast]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    const success = await performLoginInternal(false, email, password);
    if (success) {
      router.push('/explore');
    }
    setIsLoadingAuth(false); 
    return success;
  }, [performLoginInternal, router]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    const success = await performLoginInternal(true, email, password);
    if (success) {
      router.push('/admin/dashboard');
    }
    setIsLoadingAuth(false);
    return success;
  }, [performLoginInternal, router]);

  const logout = useCallback(() => {
    setIsAnimatingLogin(false); 
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    // Ensure isLoadingAuth is false on logout to prevent loading screens if any page relies on it.
    setIsLoadingAuth(false); 
    router.push('/login?message=Logout realizado com sucesso');
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, adminLogin, logout, isLoadingAuth, isAnimatingLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

