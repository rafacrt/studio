
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'; // Or a simpler layout if preferred

export default function WorkflowRootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    const workflowUserRole = localStorage.getItem('workflowUserRole');

    if (workflowUserRole === 'admin') {
      router.replace('/workflow/admin');
    } else if (workflowUserRole === 'client') {
      router.replace('/workflow/approval');
    } else {
      router.replace('/workflow/login');
    }
    // Set loading to false after redirection logic is processed.
    // The actual page content might not be visible if redirection happens quickly.
    // setIsLoading(false); // This line might be removed if page content isn't meant to show
  }, [router]);

  // Display a loading state while determining the redirect path.
  if (isLoading) {
    return (
        // Using AuthenticatedLayout for consistency, can be a simpler layout
        <AuthenticatedLayout>
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Verificando acesso...</span>
                </div>
                <p className="text-muted">Verificando acesso ao workflow...</p>
            </div>
      </AuthenticatedLayout>
    );
  }

  // Fallback content (should ideally not be reached if redirection works correctly)
  return (
    <AuthenticatedLayout>
        <div className="text-center p-5">
            <p>Redirecionando para a área de workflow...</p>
        </div>
    </AuthenticatedLayout>
  );
}
