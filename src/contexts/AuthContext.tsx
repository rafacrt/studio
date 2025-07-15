
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
      // Tenta carregar o usuário "mockado" do localStorage primeiro
      const localUser = localStorage.getItem('mockUser');
      if (localUser) {
        setUser(JSON.parse(localUser));
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
           // O redirecionamento é tratado na função logout para garantir a mensagem correta
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, isAnimatingLogin, isPageLoading]);

  const performLoginInternal = async (email: string, forAdmin: boolean): Promise<boolean> => {
    setIsAnimatingLogin(true);
    
    // Buscamos o usuário pelo email na tabela 'profiles'
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

    // Se o login for para admin, verificamos se o usuário tem a permissão
    if (forAdmin && !appUser?.isAdmin) {
         toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar a área administrativa.", variant: "destructive" });
         setIsAnimatingLogin(false);
         return false;
    }

    setUser(appUser);
    localStorage.setItem('mockUser', JSON.stringify(appUser)); 

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
      // O login normal pode ser usado tanto para admin quanto para usuário comum
      return performLoginInternal(email, false);
  };

  const adminLogin = async (email: string): Promise<boolean> => {
      // O login de admin exige que o usuário seja um admin
      return performLoginInternal(email, true);
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('mockUser');
    await supabase.auth.signOut(); // Ainda é bom chamar para limpar qualquer sessão real
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
