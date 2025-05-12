'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PostLoginAnimation from '@/components/layout/PostLoginAnimation';
import OSGrid from '@/components/os-grid/OSGrid';
import { Loader2 } from 'lucide-react';

// Session storage key
const ANIMATION_PLAYED_KEY = 'freelaos_animation_played';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true); // Default to true to play animation first time

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
    try {
      const animationPlayed = sessionStorage.getItem(ANIMATION_PLAYED_KEY);
      if (animationPlayed === 'true') {
        setShowAnimation(false);
      } else {
        // If not played or key doesn't exist, ensure animation is set to play.
        // This also handles cases where sessionStorage might have been cleared.
        setShowAnimation(true);
      }
    } catch (error) {
      console.warn("Session storage not available or error accessing it:", error);
      // Fallback if session storage is not available (e.g. SSR or incognito quirks)
      // We still want the animation to play if we can't determine if it has played before.
      setShowAnimation(true); 
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
  // This helps prevent hydration mismatches if server renders nothing for this client component body.
  if (!isClient) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando painel...</p>
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
      <div className="p-2 sm:p-4 md:p-6"> {/* Added padding for consistency */}
        <OSGrid />
      </div>
    </AuthenticatedLayout>
  );
}
