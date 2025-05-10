
"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { simulateApiCall } from '@/lib/utils';
import { mockUser, mockAdminUser } from '@/lib/mock-data'; 

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
    const storedUser = localStorage.getItem('weStudyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoadingAuth(true); // Set loading at the start
    try {
      let foundUser: User;
      if (email === mockAdminUser.email) { // Specific check for admin email
        foundUser = { ...mockAdminUser };
      } else {
        // Simulate accepting any other email/password by using the mockUser
        foundUser = { ...mockUser, email: email, isAdmin: false }; 
      }
      
      await simulateApiCall(foundUser, 500); 
      
      setUser(foundUser);
      localStorage.setItem('weStudyUser', JSON.stringify(foundUser));
      setIsLoadingAuth(false); // Set loading to false AFTER user state and localStorage are updated

      if (foundUser.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/explore');
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoadingAuth(false); // Ensure loading is false on error
      throw new Error("Credenciais inválidas"); 
    }
    // No finally block needed for setIsLoadingAuth if handled in try/catch correctly
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weStudyUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: !!user?.isAdmin, isLoadingAuth, login, logout }}>
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

