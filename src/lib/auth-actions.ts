'use server';

import { redirect } from 'next/navigation';
import * as auth from './auth'; 
import type { User } from './types';

// This login server action is no longer called from the UI but kept for potential future use.
export async function login(username: string, password?: string): Promise<null | undefined> {
  console.log('[AuthActions] Server action "login" invoked for user:', username);
  try {
    const user = await auth.login(username, password); 
    if (user) {
      console.log('[AuthActions] auth.login successful for:', username, '. Redirecting to /dashboard.');
      redirect('/dashboard'); 
    } else {
      console.log('[AuthActions] auth.login returned null for:', username);
      return null; 
    }
  } catch (e: any) {
    const isRedirectError = e.digest?.includes('NEXT_REDIRECT') || (typeof e.message === 'string' && e.message.includes('NEXT_REDIRECT'));
    
    if (isRedirectError) {
      console.log('[AuthActions] Caught NEXT_REDIRECT from login, re-throwing.');
      throw e; 
    }
    
    console.error('[AuthActions] Internal server error during login for user:', username);
    if (e instanceof Error) {
      console.error('[AuthActions] Error Name:', e.name);
      console.error('[AuthActions] Error Message:', e.message);
      console.error('[AuthActions] Error Stack:', e.stack);
      throw e;
    } else {
      const errorMessage = String(e) || 'Ocorreu um erro desconhecido no servidor.';
      console.error('[AuthActions] Caught non-Error object:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Logout will clear the cookie (if any) and redirect to dashboard as login is removed.
export async function logout(): Promise<void> {
  console.log('[AuthActions] Server action "logout" invoked.');
  try {
    await auth.logout(); // Clears the cookie
  } catch (e: any) {
    console.error('[AuthActions] Internal server error during auth.logout().');
    if (e instanceof Error) {
      console.error('[AuthActions] Logout Error Name:', e.name);
      console.error('[AuthActions] Logout Error Message:', e.message);
      console.error('[AuthActions] Logout Error Stack:', e.stack);
    } else {
      console.error('[AuthActions] Logout Caught non-Error object:', String(e));
    }
  }
  // Redirect to dashboard as login page is removed.
  redirect('/dashboard');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // This will now always return a mock user due to changes in src/lib/auth.ts
    const user = await auth.getCurrentUser();
    return user;
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in getCurrentUser server action. Error:', e.message);
    if (e instanceof Error && e.stack) {
      console.error('[AuthActions] getCurrentUser stack:', e.stack);
    }
    return null; // Should ideally not be reached if auth.getCurrentUser is robust
  }
}
