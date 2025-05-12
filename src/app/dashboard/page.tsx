
'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PostLoginAnimation from '@/components/layout/PostLoginAnimation';
import OSGrid from '@/components/os-grid/OSGrid';
// Removed Loader2, using Bootstrap spinner

// Session storage key
const ANIMATION_PLAYED_KEY = 'freelaos_animation_played';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  // Default to false now that login screen is removed, animation plays first time only
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
    try {
      const animationPlayed = sessionStorage.getItem(ANIMATION_PLAYED_KEY);
      if (animationPlayed !== 'true') {
        // Play animation only if it hasn't been played
        setShowAnimation(true);
      } else {
        setShowAnimation(false);
      }
    } catch (error) {
      console.warn("Session storage not available or error accessing it:", error);
      // Fallback: Don't show animation if session storage fails
      setShowAnimation(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    try {
      sessionStorage.setItem(ANIMATION_PLAYED_KEY, 'true');
    } catch (error) {
      console.warn("Error setting session storage:", error);
    }
  };

  // Initial loading state until isClient is true.
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

  if (showAnimation) {
    return (
      <AuthenticatedLayout>
        <PostLoginAnimation onAnimationComplete={handleAnimationComplete} />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Use Bootstrap padding classes */}
      <div className="p-2 p-sm-3 p-md-4">
        <OSGrid />
      </div>
    </AuthenticatedLayout>
  );
}
