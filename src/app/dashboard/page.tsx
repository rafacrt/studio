
'use client'; // Make this a Client Component to manage state

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for buttons
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PostLoginAnimation from '@/components/layout/PostLoginAnimation';
import OSGrid from '@/components/os-grid/OSGrid'; // Import OSGrid
import { CreateOSDialog } from '@/components/os/CreateOSDialog'; // Keep dialog trigger here at top level
import { Calendar, Building, FileText as ReportIcon } from 'lucide-react'; // Import icons

// Session storage key
const ANIMATION_PLAYED_KEY = 'freelaos_animation_played';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false); // Default to false

  useEffect(() => {
    setIsClient(true);
    // Access sessionStorage only on the client side after mount
    try {
      const animationPlayed = sessionStorage.getItem(ANIMATION_PLAYED_KEY);
      if (animationPlayed !== 'true') {
        setShowAnimation(true);
      } else {
        setShowAnimation(false); // Explicitly set to false if already played
      }
    } catch (error) {
      console.warn("Session storage not available or error accessing it:", error);
      setShowAnimation(false); // Fallback to not showing animation
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    try {
      sessionStorage.setItem(ANIMATION_PLAYED_KEY, 'true');
    } catch (error) {
      console.warn("Error setting session storage:", error);
    }
  };

  // Loading state before client-side hydration
  if (!isClient) {
    return (
      <AuthenticatedLayout>
        <div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
           <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
           </div>
          <p className="mt-3 text-muted fs-5">Carregando painel...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show animation if needed
  if (showAnimation) {
    return (
      <AuthenticatedLayout>
        <PostLoginAnimation onAnimationComplete={handleAnimationComplete} />
      </AuthenticatedLayout>
    );
  }

  // Render the main dashboard content
  return (
    <AuthenticatedLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-2"> {/* Added flex-wrap and gap */}
        <h1 className="h3 mb-0 me-auto">Ordens de Serviço</h1>
         <div className="d-flex gap-2 flex-wrap"> {/* Group buttons, allow wrapping */}
            <Link href="/calendar" className="btn btn-sm btn-outline-secondary">
                <Calendar size={16} className="me-1" /> Calendário
            </Link>
             <Link href="/entities" className="btn btn-sm btn-outline-info">
                 <Building size={16} className="me-1" /> Entidades
             </Link>
              <Link href="/reports" className="btn btn-sm btn-outline-warning">
                 <ReportIcon size={16} className="me-1" /> Relatórios
             </Link>
            <CreateOSDialog /> {/* Place the "Nova OS" button here */}
        </div>
      </div>
      {/* OSGrid now contains the filter/sort controls and the grid itself */}
      <OSGrid />
    </AuthenticatedLayout>
  );
}

