"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { simulateApiCall } from '@/lib/utils';
import { mockUser } from '@/lib/mock-data'; // Will be created

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password?: string) => Promise<void>; // Password optional for demo
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
    // Simulate API call for login
    try {
      // In a real app, you'd validate credentials against a backend
      // For this demo, we'll use a mock user if email matches
      const foundUser = email === mockUser.email ? mockUser : null;
      
      if (foundUser) {
        await simulateApiCall(foundUser, 500); // Simulate network delay
        setUser(foundUser);
        localStorage.setItem('alugoUser', JSON.stringify(foundUser));
        router.push('/explore');
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login error (e.g., show a toast message)
      throw error; // Re-throw for the login page to handle
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
