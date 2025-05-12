
'use client';

import React, { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  // Effect to read theme from localStorage on initial client load
  useEffect(() => {
    const storedTheme = localStorage.getItem('freelaos-theme') as Theme | null;
    // Check system preference if no theme is stored
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

    if (initialTheme) {
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-bs-theme', initialTheme);
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('freelaos-theme', newTheme);
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      return newTheme;
    });
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
