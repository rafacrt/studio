
'use client';

import type { ReactNode } from 'react';
import { ArtworkProvider } from '@/context/ArtworkContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false); // Default to false
  const [isClientCheckComplete, setIsClientCheckComplete] = useState(false); // Tracks if client-side check is done

  useEffect(() => {
    // This effect runs only on the client side after hydration
    const role = localStorage.getItem('workflowUserRole');
    if (!role) {
      router.replace('/workflow/login');
    } else {
      setIsAuthorized(true);
    }
    setIsClientCheckComplete(true); // Mark client-side check as complete
  }, [router]);

  // If client-side check is not complete yet, show loading.
  // This ensures server and initial client render are consistent (show loader).
  if (!isClientCheckComplete) {
    return (
        <div className="d-flex vh-100 align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    );
  }

  // If client check is complete AND user is authorized, show content.
  // If not authorized, user would have been redirected by the useEffect.
  // This part will only render on the client after authorization is confirmed.
  if (isAuthorized) {
    return (
      <ArtworkProvider>
        <AuthenticatedLayout>
          {children}
        </AuthenticatedLayout>
      </ArtworkProvider>
    );
  }

  // If client check is complete but not authorized (e.g., mid-redirect), show loader.
  // This state should be brief.
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
        </div>
    </div>
  );
}

