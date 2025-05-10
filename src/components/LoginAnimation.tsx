
'use client';

import { AppLogo } from '@/components/AppLogo';

export function LoginAnimation() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="animate-pulse">
        <AppLogo className="h-20 w-auto sm:h-24" />
      </div>
      <p className="mt-6 text-lg font-semibold text-foreground">Conectando...</p>
    </div>
  );
}
