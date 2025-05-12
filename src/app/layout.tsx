
import type {Metadata} from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Script from 'next/script'; // Import Script component
import ThemeProvider from '@/components/theme/ThemeProvider'; // Import ThemeProvider

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
    // ThemeProvider will wrap the html tag to manage the theme attribute
    <ThemeProvider>
        {/* suppressHydrationWarning is handled by ThemeProvider */}
        <html lang="pt-BR">
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
          <body className="antialiased d-flex flex-column min-vh-100">
            <Providers>
               {/* Wrap children in a div for potential page transition effects */}
               <div className="page-transition-container">
                 {children}
               </div>
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
    </ThemeProvider>
  );
}
