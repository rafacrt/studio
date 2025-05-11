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
    const user = await auth.login(username, password); // auth.login sets the cookie
    if (user) {
      console.log('[AuthActions] auth.login successful for:', username, '. Redirecting to /dashboard.');
      redirect('/dashboard'); // This throws NEXT_REDIRECT
      // Code after redirect() is not executed.
    } else {
      console.log('[AuthActions] auth.login returned null (credentials incorrect for user):', username);
      return null; // Authentication failed
    }
  } catch (e: any) {
    const isRedirectError = e.digest?.includes('NEXT_REDIRECT') || (typeof e.message === 'string' && e.message.includes('NEXT_REDIRECT'));
    
    if (isRedirectError) {
      console.log('[AuthActions] Caught NEXT_REDIRECT from login, re-throwing.');
      throw e; // Re-throw to let Next.js handle the redirect
    }
    
    // Log the actual error on the server for debugging
    console.error('[AuthActions] Internal server error during login for user:', username);
    if (e instanceof Error) {
      console.error('[AuthActions] Error Name:', e.name);
      console.error('[AuthActions] Error Message:', e.message);
      console.error('[AuthActions] Error Stack:', e.stack);
    } else {
      // If it's not an Error instance, log its string representation
      console.error('[AuthActions] Caught non-Error object:', String(e));
    }

    // Throw a new, simple error to be sent to the client.
    // This message should be what AuthForm.tsx receives in error.message.
    throw new Error('Ocorreu um erro inesperado no servidor. Tente novamente.');
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
    // Even if logout fails to clear cookie for some reason, try to redirect.
    // Or, rethrow a generic error. For logout, failing to redirect might be worse.
    // For now, let's rethrow a generic error, but redirect might be an alternative.
    // throw new Error('Ocorreu um erro inesperado durante o logout.');
  }
  // Redirect should happen regardless of auth.logout() success if no error is thrown that prevents it
  // If auth.logout throws and is caught here, this redirect will still execute unless re-thrown.
  // The current logic: if auth.logout throws, log it, but then proceed to redirect.
  // If we want to signal failure more clearly, we might throw new Error here too.
  // For now, let's assume the primary goal is to get the user to the login page.
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
    return null;
  }
}
