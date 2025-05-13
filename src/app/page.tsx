// src/app/page.tsx
'use client'; // Add this directive to make it a Client Component

import Link from 'next/link';
import type { CSSProperties } from 'react'; // Import CSSProperties for style type safety

export default function HomePage() {
  // Define styles as objects for better type checking and readability
  const pageStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    backgroundColor: '#f8f9fa' // A light background color consistent with Bootstrap's bg-light
  };

  const cardStyle: CSSProperties = {
    padding: '2rem 2.5rem', // Bootstrap card-like padding
    backgroundColor: 'white',
    borderRadius: '0.375rem', // Bootstrap's default border-radius
    boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)', // Bootstrap's shadow-sm
    maxWidth: '600px',
    width: '100%'
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.75rem', // Bootstrap h2-like size
    fontWeight: 'bold',
    color: '#0d6efd', // Bootstrap's primary color
    marginBottom: '1rem'
  };

  const paragraphStyle: CSSProperties = {
    fontSize: '1.125rem', // Bootstrap fs-5 like size
    color: '#6c757d', // Bootstrap's text-muted
    marginBottom: '2rem'
  };

  const linkStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem', // Bootstrap btn-lg like padding
    fontSize: '1.125rem', // Larger text for primary button
    color: 'white',
    backgroundColor: '#0d6efd', // Bootstrap's btn-primary background
    textDecoration: 'none',
    borderRadius: '0.375rem',
    border: '1px solid #0d6efd', // Bootstrap's btn-primary border
    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out'
  };

  const footerStyle: CSSProperties = {
    marginTop: '3rem',
    color: '#6c757d', // Bootstrap's text-muted
    fontSize: '0.875rem' // Bootstrap's small text size
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          Bem-vindo ao FreelaOS Minimal
        </h1>
        <p style={paragraphStyle}>
          Acesse o painel de Ordens de Serviço:
        </p>
        <Link
          href="/dashboard"
          style={linkStyle}
          onMouseOver={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.backgroundColor = '#0b5ed7';
            target.style.borderColor = '#0a58ca';
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.backgroundColor = '#0d6efd';
            target.style.borderColor = '#0d6efd';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <rect width="7" height="7" x="3" y="3" rx="1"></rect>
            <rect width="7" height="7" x="14" y="3" rx="1"></rect>
            <rect width="7" height="7" x="14" y="14" rx="1"></rect>
            <rect width="7" height="7" x="3" y="14" rx="1"></rect>
          </svg>
          Painel de Ordens de Serviço
        </Link>
      </div>
      <footer style={footerStyle}>
        © {new Date().getFullYear()} FreelaOS Minimal
      </footer>
    </div>
  );
}
