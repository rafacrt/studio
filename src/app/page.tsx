// This page's logic is largely handled by middleware.ts
// It will redirect to /login or /dashboard based on auth state.
// We can keep it minimal or show a loading indicator.

import { Loader2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading FreelaOS...</p>
    </div>
  );
}
