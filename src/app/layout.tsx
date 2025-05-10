
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { LoginAnimationWrapper } from '@/components/LoginAnimationWrapper'; // Import the wrapper

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WeStudy - Seu Próximo Quarto',
  description: 'Descubra e reserve quartos universitários com o WeStudy. Inspirado no Quinto Andar, projetado para praticidade.',
  applicationName: 'WeStudy',
  appleWebApp: {
    capable: true,
    title: 'WeStudy',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WeStudy" />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <LoginAnimationWrapper /> 
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
