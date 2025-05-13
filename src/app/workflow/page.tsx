
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Or a simpler layout if preferred

export default function WorkflowRootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Starts true

  useEffect(() => {
    // This logic is largely redundant due to WorkflowLayout,
    // but kept for robustness or if layout logic changes.
    const workflowUserRole = localStorage.getItem('workflowUserRole');

    if (workflowUserRole === 'admin') {
      router.replace('/workflow/admin');
    } else if (workflowUserRole === 'client') {
      router.replace('/workflow/approval');
    } else {
      // If no role, the layout should have already redirected to login.
      // This case might not be hit if layout works perfectly.
      router.replace('/workflow/login');
    }
    // CRITICAL: Ensure isLoading is set to false after attempting redirect.
    // This prevents the loader on this page from being "eternal".
    setIsLoading(false);
  }, [router]);

  // This page should ideally show a loader only very briefly
  // as the layout or its own useEffect should redirect quickly.
  if (isLoading) {
    return (
        <AuthenticatedLayout>
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Redirecionando...</span>
                </div>
                <p className="text-muted">Redirecionando para a área de workflow...</p>
            </div>
      </AuthenticatedLayout>
    );
  }

  // This content should ideally not be seen for long, if at all,
  // as redirection should occur.
  return (
    <AuthenticatedLayout>
        <div className="text-center p-5">
            <p>Redirecionando... Se você está vendo esta mensagem por muito tempo, pode haver um problema.</p>
            <button onClick={() => router.replace('/workflow/login')} className="btn btn-primary mt-3">
                Tentar ir para o Login
            </button>
        </div>
    </AuthenticatedLayout>
  );
}

