// Removed: import { cookies } from 'next/headers';
import type { User } from './types';
import { MOCK_USER_ID } from './constants'; // Keep constants separate

// Removed login, logout, createMockToken, parseMockToken functions as they used cookies()
// and are not currently needed due to login bypass.

// getCurrentUser now always returns a mock user, bypassing cookie check for direct access.
export async function getCurrentUser(): Promise<User | null> {
  console.log('[Auth getCurrentUser] Bypassing cookie check, returning mock user.');
  // In a real app, you would fetch the user based on the session/token.
  // Since login is bypassed, we return a static mock user.
  return {
    id: MOCK_USER_ID,
    username: 'Usuário Convidado', // Mock username
  };
}
