
"use client"; 

import type { Metadata, Viewport } from 'next'; 
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { LoginAnimationWrapper } from '@/components/LoginAnimationWrapper';
import { usePathname, useSearchParams } from 'next/navigation'; 
import { useEffect, useRef, Suspense } from 'react'; // Importar Suspense

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Metadata e Viewport podem precisar ser exportados de forma diferente ou gerenciados via head tag se o RootLayout se tornar totalmente client-side.
// Por ora, mantemos como está, mas pode gerar warnings ou precisar de ajustes.
// export const metadata: Metadata = { // Comentado para evitar erro de "metadata export from client component"
//   title: 'WeStudy - Seu Próximo Quarto',
//   description: 'Descubra e reserve quartos universitários com o WeStudy. Inspirado no Quinto Andar, projetado para praticidade.',
//   applicationName: 'WeStudy',
//   appleWebApp: {
//     capable: true,
//     title: 'WeStudy',
//     statusBarStyle: 'default',
//   },
// };

// export const viewport: Viewport = { // Comentado para evitar erro de "viewport export from client component"
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
//     { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
//   ],
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
// };

function PageLoadingEffect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startPageLoading, finishPageLoading } = useAuth();
  const previousPathRef = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    if (currentPath !== previousPathRef.current) {
      startPageLoading();
      previousPathRef.current = currentPath; 
      const timer = setTimeout(() => {
        finishPageLoading();
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
          <PageLoadingEffect /> 
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
