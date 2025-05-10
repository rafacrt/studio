'use server';

import { redirect } from 'next/navigation';
import * as auth from './auth'; // Assuming auth.ts exports login, logout, getCurrentUser
import type { User } from './types';

export async function login(username: string, password?: string): Promise<User | null> {
  const user = await auth.login(username, password);
  if (user) {
    // No direct redirect here, let the client handle it for better UX with toasts
    // redirect('/dashboard'); // This would be typical if not for client-side toast
    return user;
  }
  return null;
}

export async function logout(): Promise<void> {
  await auth.logout();
  redirect('/login');
}

export async function getCurrentUser(): Promise<User | null> {
  return auth.getCurrentUser();
}
