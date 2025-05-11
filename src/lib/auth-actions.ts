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
      console.log('[AuthActions] Caught NEXT_REDIRECT, re-throwing.');
      throw e;
    }
    
    // Log more details for non-redirect errors
    console.error(
      '[AuthActions] Non-redirect error in login server action for user:', username, 
      'ErrorDigest:', e.digest, 
      'ErrorMessage:', e.message, 
      // 'ErrorStack:', e.stack, // Stack can be very verbose, consider enabling if needed
      'FullError:', JSON.stringify(e, Object.getOwnPropertyNames(e)) // Attempt to serialize more of the error
    );
    throw new Error('Falha no servidor durante o login. Por favor, tente novamente mais tarde.');
  }
}

export async function logout(): Promise<void> {
  console.log('[AuthActions] Server action "logout" invoked.');
  try {
    await auth.logout();
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in logout server action. Error:', e.message, 'Stack:', e.stack);
    throw e;
  }
  redirect('/login');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await auth.getCurrentUser();
    return user;
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in getCurrentUser server action. Error:', e.message, 'Stack:', e.stack);
    return null;
  }
}
