
'use client';

import type { ReactNode } from 'react';
import { ArtworkProvider } from '@/context/ArtworkContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Main app layout for header/footer
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false); // To prevent flash of content

  useEffect(() => {
    // Client-side check for workflow authentication
    const role = localStorage.getItem('workflowUserRole');
    if (!role) {
      router.replace('/workflow/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized && typeof window !== 'undefined' && !localStorage.getItem('workflowUserRole')) {
    // Still checking or about to redirect, show minimal loading
    return (
        <div className="d-flex vh-100 align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    );
  }


  return (
    <ArtworkProvider>
        {/* Using AuthenticatedLayout to keep a consistent header/footer from the main app if desired.
            If a completely separate look is needed for workflow, this can be a simpler <div> */}
      <AuthenticatedLayout>
        {isAuthorized ? children : null}
      </AuthenticatedLayout>
    </ArtworkProvider>
  );
}
