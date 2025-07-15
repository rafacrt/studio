
"use client";
import { useAuth } from '@/packages/auth/AuthContext';
import AppLogo from '@/web/components/AppLogo';
import { useEffect, useState } from 'react';

export function LoginAnimationWrapper() { // O nome do arquivo e da função será mantido por enquanto para evitar quebra de importações, mas o propósito é mais amplo.
  const { isAnimatingLogin, user, isPageLoading } = useAuth();
  const [internalShow, setInternalShow] = useState(false);

  const shouldShowOverlay = isAnimatingLogin || isPageLoading;

  useEffect(() => {
    if (shouldShowOverlay) {
      setInternalShow(true);
    } else {
      const timer = setTimeout(() => {
        setInternalShow(false);
      }, 500); // Duração da animação de fade-out
      return () => clearTimeout(timer);
    }
  }, [shouldShowOverlay]);

  if (!shouldShowOverlay && !internalShow) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out
                  ${ (shouldShowOverlay || internalShow) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!(shouldShowOverlay || internalShow)}
    >
      <AppLogo className="h-24 w-auto animate-pulse" />
      { (isAnimatingLogin && internalShow) && user && ( // Mostrar nome apenas durante animação de LOGIN
        <p className="mt-4 text-xl font-semibold text-foreground">Bem-vindo, {user.name}!</p>
      )}
    </div>
  );
}
