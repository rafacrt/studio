'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import OSGrid from '@/components/os-grid/OSGrid';
import PostLoginAnimation from '@/components/layout/PostLoginAnimation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';


export default function DashboardPage() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const animationShown = sessionStorage.getItem('postLoginAnimationShown');
    if (animationShown) {
      setShowAnimation(false);
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    if (isClient) { // Check isClient again, though it should be true here
      sessionStorage.setItem('postLoginAnimationShown', 'true');
    }
  };

  // Render a loader or minimal content on the server or before client hydration
  // to prevent hydration mismatch issues with showAnimation state.
  if (!isClient) {
    return (
      <AuthenticatedLayout>
         <div className="flex items-center justify-center flex-1 py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Carregando painel...</p>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      {showAnimation ? (
        <PostLoginAnimation onAnimationComplete={handleAnimationComplete} />
      ) : (
        <OSGrid />
      )}
    </AuthenticatedLayout>
  );
}
