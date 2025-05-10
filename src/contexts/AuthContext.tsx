
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
  isAnimatingLogin: boolean; // Added for animation state
  login: (email: string, password?: string) => Promise<void>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAnimatingLogin, setIsAnimatingLogin] = useState(false); // New state for animation
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('weStudyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoadingAuth(true);
    try {
      let foundUser: User;
      if (email === mockAdminUser.email) { 
        foundUser = { ...mockAdminUser };
      } else {
        // Dynamically create user details for non-admin login
        const userName = email.split('@')[0].replace(/[._0-9]/g, ' ').split(' ').map(namePart => namePart.charAt(0).toUpperCase() + namePart.slice(1)).join(' ');
        foundUser = { 
          ...mockUser, // Use base mockUser structure but override with dynamic details
          id: `user-${Date.now()}`, // More unique ID
          email: email, 
          name: userName || "Usuário",
          avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(email)}/100/100`, // Ensure email is encoded for URL
          isAdmin: false 
        };
      }
      
      await simulateApiCall(foundUser, 500); 
      
      setIsAnimatingLogin(true); // Start animation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Animation duration

      setUser(foundUser);
      localStorage.setItem('weStudyUser', JSON.stringify(foundUser));
      
      setIsAnimatingLogin(false); // Stop animation
      setIsLoadingAuth(false); // Set loading to false AFTER animation and user state update

      if (foundUser.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/explore');
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsAnimatingLogin(false); // Reset animation on error
      setIsLoadingAuth(false); // Ensure loading is false on error
      throw new Error("Credenciais inválidas"); 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weStudyUser');
    setIsAnimatingLogin(false); // Ensure animation state is reset on logout
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: !!user?.isAdmin, isLoadingAuth, isAnimatingLogin, login, logout }}>
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
