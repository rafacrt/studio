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
      // Code after redirect() is not executed in the context of returning to the client.
      // Thus, this function won't explicitly return in the success case seen by the caller.
    } else {
      console.log('[AuthActions] auth.login returned null (credentials incorrect for user):', username);
      return null; // Authentication failed
    }
  } catch (e: any) {
    // Check if it's a redirect error and re-throw it for Next.js to handle
    if (e.message?.includes('NEXT_REDIRECT') || e.digest?.includes('NEXT_REDIRECT')) {
      console.log('[AuthActions] Caught NEXT_REDIRECT, re-throwing.');
      throw e;
    }
    // Handle other errors
    console.error('[AuthActions] CRITICAL ERROR in login server action for user:', username, 'Error:', e.message, 'Stack:', e.stack);
    // Throw a new error that the client can display
    throw new Error('Falha no servidor durante o login. Por favor, tente novamente mais tarde.');
  }
}

export async function logout(): Promise<void> {
  console.log('[AuthActions] Server action "logout" invoked.');
  try {
    await auth.logout();
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in logout server action. Error:', e.message, 'Stack:', e.stack);
    // Re-throw the error to be handled or logged by Next.js
    throw e;
  }
  // Redirect after logout
  redirect('/login');
}

export async function getCurrentUser(): Promise<User | null> {
  // console.log('[AuthActions] Server action "getCurrentUser" invoked.');
  try {
    const user = await auth.getCurrentUser();
    // console.log('[AuthActions] getCurrentUser result:', user ? user.username : 'No user');
    return user;
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in getCurrentUser server action. Error:', e.message, 'Stack:', e.stack);
    return null;
  }
}
