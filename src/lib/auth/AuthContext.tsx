
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { useToast } from '@/components/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

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
      return null;
    }
    return profile;
  }, [supabase]);


  useEffect(() => {
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
        }
      } else {
        setUser(null);
        // Redirecionar para o login se não estiver em uma página pública
        const publicPaths = ['/login', '/signup'];
        if (!publicPaths.includes(pathname)) {
          router.push('/login?message=Sessão expirada. Faça login novamente.');
        }
      }
      setIsLoadingAuth(false);
    });

    // Verificação inicial de estado
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
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login?message=Logout realizado com sucesso');
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
    isAnimatingLogin, // Manter por compatibilidade de UI
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
