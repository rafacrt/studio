
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

// Helper para mapear um perfil do banco para o tipo User
const mapProfileToAppUser = (profile: any): User | null => {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    isAdmin: profile.is_admin,
    role: profile.is_admin ? "Admin" : "Usuário",
    dateJoined: profile.created_at,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Manter a verificação de sessão do Supabase, mas o login será mockado
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Se houver uma sessão Supabase real, use-a (permite que o logout funcione)
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser(mapProfileToAppUser(profile));
      } else {
         // Tenta carregar o usuário "mockado" do localStorage
        const localUser = localStorage.getItem('mockUser');
        if (localUser) {
          setUser(JSON.parse(localUser));
        }
      }
      setIsLoadingAuth(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
           localStorage.removeItem('mockUser');
           setUser(null);
           if(isAnimatingLogin) setIsAnimatingLogin(false);
           if(isPageLoading) setIsPageLoading(false);
           router.push('/login?message=Logout realizado com sucesso');
        } else if (session) {
           const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
           setUser(mapProfileToAppUser(profile));
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, isAnimatingLogin, isPageLoading]);

  const performLoginInternal = async (email: string, forAdmin: boolean): Promise<boolean> => {
    setIsAnimatingLogin(true);
    
    // Em vez de 'signInWithPassword', buscamos o usuário pelo email
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !profile) {
      toast({ title: "Erro de Login", description: "Usuário não encontrado.", variant: "destructive" });
      setIsAnimatingLogin(false);
      return false;
    }
    
    const appUser = mapProfileToAppUser(profile);

    if (forAdmin && !appUser?.isAdmin) {
         toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar a área administrativa.", variant: "destructive" });
         setIsAnimatingLogin(false);
         return false;
    }

    setUser(appUser);
    localStorage.setItem('mockUser', JSON.stringify(appUser)); // Salva o usuário mockado

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnimatingLogin(false);

    if (appUser?.isAdmin) {
        router.push('/admin');
    } else {
        router.push('/explore');
    }
    return true;
  };

  const login = async (email: string): Promise<boolean> => {
      return performLoginInternal(email, false);
  };

  const adminLogin = async (email: string): Promise<boolean> => {
      return performLoginInternal(email, true);
  };

  const logout = useCallback(async () => {
    // Limpa o usuário mockado e desloga do Supabase, se houver sessão
    localStorage.removeItem('mockUser');
    await supabase.auth.signOut();
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
