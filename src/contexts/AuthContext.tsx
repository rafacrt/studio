
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

const supabase = createClient();

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoadingAuth: boolean;
  isAnimatingLogin: boolean;
  isPageLoading: boolean; 
  startPageLoading: () => void; 
  finishPageLoading: () => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || 'Usuário',
    avatarUrl: supabaseUser.user_metadata?.avatar_url || undefined,
    isAdmin: supabaseUser.user_metadata?.is_admin || false,
    role: supabaseUser.user_metadata?.is_admin ? "Admin" : "Usuário",
    dateJoined: supabaseUser.created_at,
  };
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const appUser = mapSupabaseUserToAppUser(session?.user ?? null);
      setUser(appUser);
      setIsLoadingAuth(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const appUser = mapSupabaseUserToAppUser(session?.user ?? null);
        setUser(appUser);
        
        if (event === 'SIGNED_OUT') {
           if(isAnimatingLogin) setIsAnimatingLogin(false);
           if(isPageLoading) setIsPageLoading(false);
           router.push('/login?message=Logout realizado com sucesso');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, isAnimatingLogin, isPageLoading]);

  const performLoginInternal = async (email: string, password: string, forAdmin: boolean): Promise<boolean> => {
    setIsAnimatingLogin(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Erro de Login", description: "Email ou senha inválidos.", variant: "destructive" });
      setIsAnimatingLogin(false);
      return false;
    }
    
    if (data.user) {
        const appUser = mapSupabaseUserToAppUser(data.user);

        if (forAdmin && !appUser?.isAdmin) {
             await supabase.auth.signOut();
             toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar a área administrativa.", variant: "destructive" });
             setIsAnimatingLogin(false);
             return false;
        }

        setUser(appUser);

        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsAnimatingLogin(false);

        if (appUser?.isAdmin) {
            router.push('/admin');
        } else {
            router.push('/explore');
        }
        return true;
    }

    setIsAnimatingLogin(false);
    return false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
      return performLoginInternal(email, password, false);
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
      return performLoginInternal(email, password, true);
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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
