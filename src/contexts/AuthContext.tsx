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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Initialize to true
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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
          // No redirect here, let pages handle unauthorized access or redirect to login
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


  const performLogin = useCallback(async (isAdminLogin: boolean, _email?: string, _password?: string): Promise<boolean> => {
    // _email and _password are not used with mock users but kept for signature consistency
    setIsAnimatingLogin(true); // Start UI animation for LoginAnimationWrapper

    // This outer Promise is for the entire performLogin operation
    return new Promise<boolean>((resolveLoginAttempt) => {
      // Simulate API call delay
      setTimeout(async () => {
        try {
          const userToLogin = isAdminLogin ? mockAdminUser : mockUser;
          setUser(userToLogin);
          setIsAuthenticated(true);
          setIsAdmin(isAdminLogin);
          localStorage.setItem('user', JSON.stringify(userToLogin));
          localStorage.setItem('isAdmin', String(isAdminLogin));

          // Simulate animation duration for UX before navigation
          // This is part of the "successful login" flow
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setIsAnimatingLogin(false); // Stop UI animation; LoginAnimationWrapper will fade out
          
          router.push(isAdminLogin ? '/admin/dashboard' : '/explore');
          resolveLoginAttempt(true); // Login action successful
        } catch (e) {
          console.error("Login failed", e);
          toast({ title: "Erro de Login", description: "Falha ao tentar fazer login.", variant: "destructive" });
          setIsAnimatingLogin(false); // Ensure animation stops on error
          resolveLoginAttempt(false); // Login action failed
        }
      }, 500); // Delay to simulate network request before "login logic"
    });
  }, [router, toast]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true); // Indicate a full authentication cycle is starting
    const success = await performLogin(false, email, password);
    setIsLoadingAuth(false); // Authentication cycle ends
    return success;
  }, [performLogin]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true); // Indicate a full authentication cycle is starting
    const success = await performLogin(true, email, password);
    setIsLoadingAuth(false); // Authentication cycle ends
    return success;
  }, [performLogin]);


  const logout = useCallback(() => {
    setIsAnimatingLogin(false); // Ensure no login animation is active
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
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
