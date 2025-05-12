
'use client';

import { useState, useEffect } from 'react';

export default function FooterContent() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (currentYear === null) {
    // Render a placeholder or nothing until the year is set on the client
    return <div style={{ height: '1.5rem' }}></div>; // Placeholder to maintain layout consistency
  }

  return (
    // Use standard Bootstrap text classes
    <span className="text-muted small">
      © {currentYear} FreelaOS Minimal. Todos os direitos reservados.
    </span>
  );
}
