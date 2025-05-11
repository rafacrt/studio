'use server';

import { redirect } from 'next/navigation';
import * as auth from './auth'; 
import type { User } from './types';

// Returns null for authentication failure.
// Redirects on success.
// Throws other errors for server issues.
export async function login(username: string, password?: string): Promise<null | undefined> {
  console.log('[AuthActions] Server action "login" invoked for user:', username);
  try {
    const user = await auth.login(username, password); 
    if (user) {
      console.log('[AuthActions] auth.login successful for:', username, '. Redirecting to /dashboard.');
      redirect('/dashboard'); 
      // Code after redirect() is not executed.
    } else {
      console.log('[AuthActions] auth.login returned null (e.g. empty username for):', username);
      return null; // Authentication failed (e.g. empty username)
    }
  } catch (e: any) {
    const isRedirectError = e.digest?.includes('NEXT_REDIRECT') || (typeof e.message === 'string' && e.message.includes('NEXT_REDIRECT'));
    
    if (isRedirectError) {
      console.log('[AuthActions] Caught NEXT_REDIRECT from login, re-throwing.');
      throw e; 
    }
    
    // Log the actual error on the server for debugging
    console.error('[AuthActions] Internal server error during login for user:', username);
    if (e instanceof Error) {
      console.error('[AuthActions] Error Name:', e.name);
      console.error('[AuthActions] Error Message:', e.message);
      console.error('[AuthActions] Error Stack:', e.stack);
      // Re-throw the original error if it's an Error instance.
      // Next.js should be able to serialize standard Error objects.
      // The 'digest' will be added by Next.js if it's not already there.
      throw e;
    } else {
      // If 'e' is not an Error instance, log its string representation and wrap it in a new Error.
      const errorMessage = String(e) || 'Ocorreu um erro desconhecido no servidor.';
      console.error('[AuthActions] Caught non-Error object:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export async function logout(): Promise<void> {
  console.log('[AuthActions] Server action "logout" invoked.');
  try {
    await auth.logout();
  } catch (e: any) {
    // Log the actual error on the server for debugging
    console.error('[AuthActions] Internal server error during logout.');
    if (e instanceof Error) {
      console.error('[AuthActions] Logout Error Name:', e.name);
      console.error('[AuthActions] Logout Error Message:', e.message);
      console.error('[AuthActions] Logout Error Stack:', e.stack);
    } else {
      console.error('[AuthActions] Logout Caught non-Error object:', String(e));
    }
    // For logout, even if clearing the cookie fails, we should try to redirect.
    // If we want to signal failure more clearly, we might throw new Error here too.
  }
  // Redirect should happen regardless of auth.logout() success
  redirect('/login');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await auth.getCurrentUser();
    return user;
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in getCurrentUser server action. Error:', e.message);
    if (e instanceof Error && e.stack) {
      console.error('[AuthActions] getCurrentUser stack:', e.stack);
    }
    return null; // Gracefully return null if there's an issue fetching the user
  }
}
