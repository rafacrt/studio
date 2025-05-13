
'use client'; // Make this a client component for potential future interactions

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react'; // Icons for buttons

export default function HomePage() {
  return (
    // Use Bootstrap classes for centering, layout, and styling
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 flex-grow-1 py-5 text-center p-4 bg-light">
      <div className="card shadow-sm p-4 p-md-5" style={{ maxWidth: '600px', width: '100%' }}>
        <h1 className="h2 fw-bold mb-3 text-primary">Bem-vindo ao FreelaOS Minimal</h1>
        <p className="fs-5 text-muted mb-4">
          Acesse o painel de Ordens de Serviço:
        </p>

        <div className="d-flex justify-content-center">
          {/* Button to Dashboard */}
          <Link href="/dashboard" passHref legacyBehavior>
            <a className="btn btn-primary btn-lg px-4 gap-3 d-flex align-items-center justify-content-center">
              <LayoutGrid size={20} className="me-1" />
              Ordens de Serviço
            </a>
          </Link>
        </div>
      </div>
       {/* Simple footer */}
       <footer className="mt-5 text-muted small">
           © {new Date().getFullYear()} FreelaOS Minimal
       </footer>
    </div>
  );
}

