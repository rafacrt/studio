
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { useToast } from '@/components/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { mockUser, mockAdminUser } from '@/lib/auth-mocks';

interface AuthContextType {
  supabase: SupabaseClient;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  logout: () => void;
  isLoadingAuth: boolean;
  isAnimatingLogin: boolean;
  isPageLoading: boolean;
  startPageLoading: () => void;
  finishPageLoading: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      // Se não encontrar o perfil, deslogar para evitar estado inconsistente
      await supabase.auth.signOut();
      return null;
    }
    return profile;
  }, [supabase]);

  useEffect(() => {
    // Modo de desenvolvimento para pular o login
    if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true') {
      console.warn("AUTENTICAÇÃO IGNORADA: Usando mock user em modo de desenvolvimento.");
      // Use mockAdminUser para testar o painel de admin, ou mockUser para o usuário comum
      setUser(mockAdminUser); 
      setIsLoadingAuth(false);
      return;
    }

    // Lógica normal de autenticação com Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoadingAuth(true);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: session.user.email!,
            avatarUrl: profile.avatar_url,
            isAdmin: profile.is_admin,
          });
        } else {
            // Perfil não encontrado ou erro, força o logout
            setUser(null);
        }
      } else {
        setUser(null);
        const publicPaths = ['/login', '/signup'];
        if (!publicPaths.includes(pathname)) {
          router.push('/login?message=Sessão expirada. Faça login novamente.');
        }
      }
      setIsLoadingAuth(false);
    });

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
         const profile = await fetchUserProfile(session.user);
         if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: session.user.email!,
              avatarUrl: profile.avatar_url,
              isAdmin: profile.is_admin,
            });
          }
      }
      setIsLoadingAuth(false);
    };
    checkInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, fetchUserProfile, router, pathname]);

  const logout = useCallback(async () => {
    setIsPageLoading(true);
    if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true') {
        setUser(null);
        router.push('/login?message=Logout (DEV) realizado com sucesso');
    } else {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login?message=Logout realizado com sucesso');
    }
    setIsPageLoading(false);
  }, [supabase.auth, router]);

  const startPageLoading = useCallback(() => setIsPageLoading(true), []);
  const finishPageLoading = useCallback(() => setIsPageLoading(false), []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  const value: AuthContextType = {
    supabase,
    isAuthenticated,
    isAdmin,
    user,
    logout,
    isLoadingAuth,
    isAnimatingLogin,
    isPageLoading,
    startPageLoading,
    finishPageLoading
  };

  return (
    <AuthContext.Provider value={value}>
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
