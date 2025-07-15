
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the dashboard, which is now the main admin page.
export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return null; // Render nothing while redirecting
}
