"use client";
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/AppLogo'; 
import { useEffect, useState } from 'react';

export function LoginAnimationWrapper() {
  const { isAnimatingLogin, user } = useAuth();
  const [internalShow, setInternalShow] = useState(false);

  useEffect(() => {
    if (isAnimatingLogin) {
      setInternalShow(true);
    } else {
      // When isAnimatingLogin becomes false, start a timer to hide after animation.
      // This ensures the fade-out transition can complete.
      const timer = setTimeout(() => {
        setInternalShow(false);
      }, 500); // Match CSS transition duration (or slightly longer)
      return () => clearTimeout(timer);
    }
  }, [isAnimatingLogin]);

  // Only render if the animation is active or fading out
  if (!isAnimatingLogin && !internalShow) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out
                  ${ (isAnimatingLogin || internalShow) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!(isAnimatingLogin || internalShow)} // For accessibility
    >
      <AppLogo className="h-24 w-auto animate-pulse" />
      { (isAnimatingLogin || internalShow) && user && (
        <p className="mt-4 text-xl font-semibold text-foreground">Bem-vindo, {user.name}!</p>
      )}
    </div>
  );
}
