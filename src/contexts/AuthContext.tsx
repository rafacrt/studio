"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { simulateApiCall } from '@/lib/utils';
import { mockUser } from '@/lib/mock-data'; 

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password?: string) => Promise<void>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('alugoUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoadingAuth(true);
    try {
      // Simulate accepting any email/password by always using the mockUser
      const foundUser = { ...mockUser, email: email }; // Use provided email for display, but always "log in"
      
      await simulateApiCall(foundUser, 500); 
      setUser(foundUser);
      localStorage.setItem('alugoUser', JSON.stringify(foundUser));
      router.push('/explore');
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Credenciais inválidas"); 
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alugoUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingAuth, login, logout }}>
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

