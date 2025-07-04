
"use client"; 

import type { Metadata, Viewport } from 'next'; 
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext'; 
import { Toaster } from '@/components/ui/toaster';
import { LoginAnimationWrapper } from '@/components/LoginAnimationWrapper';
import { usePathname, useSearchParams } from 'next/navigation'; 
import { useEffect, useState, Suspense, useRef, useContext } from 'react'; // Added useContext

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// This component now handles client-side effects for page loading
function PageLoadingEffectComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Assuming useAuth() provides these, or they need to be managed differently if AuthContext isn't directly providing them here
  // For simplicity, I'll assume they are managed within AuthContext. If not, this would need adjustment.
  // This component is now rendered conditionally, so direct use of useAuth here for these functions is fine.
  const { startPageLoading, finishPageLoading } = useContext(AuthContext); 
  const previousPathRef = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    if (currentPath !== previousPathRef.current) {
      if (startPageLoading) startPageLoading();
      previousPathRef.current = currentPath; 
      const timer = setTimeout(() => {
        if (finishPageLoading) finishPageLoading();
      }, 700); 

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, startPageLoading, finishPageLoading]);

  return null; 
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        
        <title>WeStudy - Seu Próximo Quarto</title>
        <meta name="description" content="Descubra e reserve quartos universitários com o WeStudy." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WeStudy" />
        <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1C1C1E" media="(prefers-color-scheme: dark)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>
          {isMounted && <PageLoadingEffectComponent />} 
          <LoginAnimationWrapper /> 
          <Suspense fallback={<div>Carregando...</div>}>
            {children}
          </Suspense>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
