'use server';

import { redirect } from 'next/navigation';
import * as auth from './auth'; 
import type { User } from './types';

export async function login(username: string, password?: string): Promise<User | null> {
  console.log('[AuthActions] Server action "login" invoked for user:', username);
  try {
    const user = await auth.login(username, password);
    if (user) {
      console.log('[AuthActions] auth.login successful, user data for:', username, 'User ID:', user.id);
      return user;
    } else {
      console.log('[AuthActions] auth.login returned null (credentials likely incorrect for user):', username);
      return null; 
    }
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in login server action for user:', username, 'Error:', e.message, 'Stack:', e.stack);
    // Re-throw the error. This will cause the client's catch block to handle it.
    // The Next.js server will likely return a 500 error status.
    throw e; 
  }
}

export async function logout(): Promise<void> {
  console.log('[AuthActions] Server action "logout" invoked.');
  try {
    await auth.logout();
    // Redirect is handled here as per original logic
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in logout server action. Error:', e.message, 'Stack:', e.stack);
    throw e;
  }
  // The redirect should ideally be outside the try-catch if auth.logout() can throw
  // but for this mock, it's simple. If auth.logout() fails, redirect might not happen.
  redirect('/login');
}

export async function getCurrentUser(): Promise<User | null> {
  // This function is called by AuthenticatedLayout, ensure it's robust.
  // console.log('[AuthActions] Server action "getCurrentUser" invoked.');
  try {
    const user = await auth.getCurrentUser();
    // console.log('[AuthActions] getCurrentUser result:', user ? user.username : 'No user');
    return user;
  } catch (e: any) {
    console.error('[AuthActions] CRITICAL ERROR in getCurrentUser server action. Error:', e.message, 'Stack:', e.stack);
    // Depending on how critical this is, you might return null or throw.
    // For now, returning null to prevent breaking layouts entirely if there's a token parsing issue.
    return null;
  }
}

