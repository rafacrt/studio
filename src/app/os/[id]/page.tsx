
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import OSDetailsView from '@/components/os/OSDetailsView';
import { useOSStore } from '@/store/os-store';
import type { OS } from '@/lib/types';
// Removed Loader2, using Bootstrap spinner
import Link from 'next/link';

export default function OSDetailsPage() {
  const params = useParams();
  const getOSById = useOSStore((state) => state.getOSById);

  const [os, setOs] = useState<OS | undefined | null>(undefined); // undefined: loading, null: not found

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    setOs(undefined); // Reset to loading state when ID changes
    const timer = setTimeout(() => {
        if (id) {
            const foundOS = getOSById(id);
            setOs(foundOS || null);
        } else {
            setOs(null);
        }
    }, 300); // Simulate short loading delay

    return () => clearTimeout(timer);
  }, [id, getOSById]); // Dependency array includes getOSById now

  if (os === undefined) {
    return (
      <AuthenticatedLayout>
        {/* Improved Loading Spinner */}
        <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
           <div className="spinner-border text-primary me-3 mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
             <span className="visually-hidden">Carregando...</span>
           </div>
          <p className="fs-5 text-muted mb-0">Carregando detalhes da OS...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (os === null) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-5">
          <h2 className="h3 fw-semibold mb-3 text-danger">Ordem de Serviço Não Encontrada</h2>
          <p className="text-muted mb-4">A OS que você está procurando não existe ou não pôde ser carregada.</p>
           <Link href="/dashboard" className="btn btn-primary">
             Ir para o Painel
           </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Add transition wrapper */}
      <div className="transition-opacity">
         <OSDetailsView os={os} />
      </div>
    </AuthenticatedLayout>
  );
}
