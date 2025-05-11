
'use client';

import { useState, useEffect } from 'react';

export default function FooterContent() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (currentYear === null) {
    // Render a placeholder or nothing until the year is set on the client
    return <div className="h-5"></div>; // Placeholder to maintain layout consistency
  }

  return (
    <>
      © {currentYear} FreelaOS Minimal. Todos os direitos reservados.
    </>
  );
}
