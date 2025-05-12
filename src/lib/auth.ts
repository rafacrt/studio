
// Removed: import { cookies } from 'next/headers';
import type { User } from './types';
import { MOCK_USER_ID, MOCK_USERNAME } from './constants'; // Use MOCK_USERNAME

// getCurrentUser now always returns a mock user, bypassing cookie check for direct access.
// Made synchronous.
export function getCurrentUser(): User | null { // Ensure return type is explicitly User | null
  console.log('[Auth getCurrentUser] Bypassing cookie check, returning mock user.');
  // In a real app, you would fetch the user based on the session/token.
  // Since login is bypassed, we return a static mock user.
  return {
    id: MOCK_USER_ID,
    username: MOCK_USERNAME, // Use the constant for username
  };
}
