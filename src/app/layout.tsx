
import type {Metadata} from 'next';
// Removed Geist font imports
import './globals.css';
// Removed ShadCN toaster import
import Providers from '@/components/Providers';
import Script from 'next/script'; // Import Script component

// Removed Geist font variables

export const metadata: Metadata = {
  title: 'FreelaOS Minimal',
  description: 'Aplicativo Mínimo de Gerenciamento de Ordens de Serviço',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Add Bootstrap CSS CDN */}
        <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
            crossOrigin="anonymous"
        />
        {/* Add Bootstrap Icons CDN */}
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      {/* Removed Tailwind font variables from body className */}
      <body className="antialiased d-flex flex-column min-vh-100">
        <Providers>
          {children}
          {/* Removed Toaster component */}
        </Providers>
        {/* Add Bootstrap JS Bundle CDN - place at the end of body */}
        <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
            strategy="lazyOnload" // Load after page content is interactive
        />
      </body>
    </html>
  );
}
