'use client';

import { useEffect, useState } from 'react';

export default function PostLoginAnimation({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Ensure onAnimationComplete is called only once and component is mounted
      if (typeof onAnimationComplete === 'function') {
        onAnimationComplete();
      }
    }, 2000); // Animation duration: 2 seconds

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse">
        <path d="M9.75 2.75H4.75C3.64543 2.75 2.75 3.64543 2.75 4.75V9.75C2.75 10.8546 3.64543 11.75 4.75 11.75H9.75C10.8546 11.75 11.75 10.8546 11.75 9.75V4.75C11.75 3.64543 10.8546 2.75 9.75 2.75Z"></path>
        <path d="M19.25 2.75H14.25C13.1454 2.75 12.25 3.64543 12.25 4.75V9.75C12.25 10.8546 13.1454 11.75 14.25 11.75H19.25C20.3546 11.75 21.25 10.8546 21.25 9.75V4.75C21.25 3.64543 20.3546 2.75 19.25 2.75Z"></path>
        <path d="M9.75 12.25H4.75C3.64543 12.25 2.75 13.1454 2.75 14.25V19.25C2.75 20.3546 3.64543 21.25 4.75 21.25H9.75C10.8546 21.25 11.75 20.3546 11.75 19.25V14.25C11.75 13.1454 10.8546 12.25 9.75 12.25Z"></path>
        <path d="M15.75 18.25H12.75V15.25H15.75V18.25Z"></path>
        <path d="M18.25 15.75H15.75V12.75H18.25V15.75Z"></path>
        <path d="M21.25 15.75H18.25V12.75H21.25V15.75Z"></path>
        <path d="M21.25 18.25H18.25V15.25H21.25V18.25Z"></path>
        <path d="M15.75 21.25H12.75V18.25H15.75V21.25Z"></path>
        <path d="M18.25 21.25H15.75V18.25H18.25V21.25Z"></path>
        <path d="M21.25 21.25H18.25V18.25H21.25V21.25Z"></path>
      </svg>
      <p className="mt-4 text-lg text-muted-foreground">Carregando seu painel...</p>
    </div>
  );
}
