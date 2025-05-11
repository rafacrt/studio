import { cookies } from 'next/headers';
import type { User } from './types';
import { AUTH_COOKIE_NAME, MOCK_USER_ID } from './constants';

// Mock JWT: In a real app, use a library like 'jsonwebtoken'
const createMockToken = (user: Omit<User, 'id'>): string => {
  console.log('[Auth createMockToken] Attempting to create token for user:', user.username);
  try {
    const token = Buffer.from(JSON.stringify({ ...user, id: MOCK_USER_ID })).toString('base64');
    console.log('[Auth createMockToken] Token created successfully.');
    return token;
  } catch (e: any) {
    console.error('[Auth createMockToken] CRITICAL: Error during Buffer.from or JSON.stringify:', e.message, e.stack);
    throw new Error('Token creation failed due to internal server error.');
  }
};

const parseMockToken = (token: string): User | null => {
  console.log('[Auth parseMockToken] Attempting to parse token:', token ? token.substring(0,10) + '...' : 'EMPTY_TOKEN_STRING');
  if (!token) {
    console.warn('[Auth parseMockToken] Received empty or null token string.');
    return null;
  }
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsedUser = JSON.parse(decoded) as User;
    if (!parsedUser.id) {
      console.warn('[Auth parseMockToken] Parsed user object is missing an id. Assigning MOCK_USER_ID.');
      parsedUser.id = MOCK_USER_ID; 
    }
    if (!parsedUser.username) {
      console.warn('[Auth parseMockToken] Parsed user object is missing a username.');
    }
    console.log('[Auth parseMockToken] Token parsed successfully for user id:', parsedUser.id, 'username:', parsedUser.username);
    return parsedUser;
  } catch (error: any) {
    console.error('[Auth parseMockToken] Error parsing token. It might be malformed or not base64. Error:', error.message, error.stack);
    return null;
  }
};

// This login function is no longer called from the UI but kept for potential future use.
export async function login(username: string, password?: string): Promise<User | null> {
  console.log(`[Auth Login Attempt] Username: "${username}" (Password check is skipped)`);

  if (!username || typeof username !== 'string' || username.trim() === '') {
    console.log('[Auth Login Failure] Username is empty or invalid.');
    return null;
  }

  const trimmedUsername = username.trim();
  console.log('[Auth Login Success] Proceeding with login for user:', trimmedUsername);
  const userPayload: Omit<User, 'id'> = { username: trimmedUsername };
  let token: string;
  
  try {
    token = createMockToken(userPayload);
  } catch (e: any) {
    console.error('[Auth Login Critical] Error calling createMockToken:', e.message, e.stack);
    throw new Error('Server error during token generation process.'); 
  }
  
  console.log('[Auth Login Success] Generated token:', token ? token.substring(0, 20) + '...' : 'null/empty');
  if (!token) {
      console.error('[Auth Login Critical] createMockToken returned null or empty token.');
      throw new Error('Server error: Token generation resulted in empty token.');
  }
  
  try {
    cookies().set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    console.log('[Auth Login Success] Cookie set action performed for cookie name:', AUTH_COOKIE_NAME);
  } catch (e: any) {
    console.error('[Auth Login Critical] Error setting cookie using cookies().set API:', e.message, e.stack);
    throw new Error('Server error during authentication session setup.');
  }
  
  return { username: trimmedUsername, id: MOCK_USER_ID };
}

// This logout function is no longer called from the UI but kept for potential future use.
export async function logout(): Promise<void> {
  console.log('[Auth logout] Attempting to clear cookie:', AUTH_COOKIE_NAME);
  try {
    cookies().delete(AUTH_COOKIE_NAME);
    console.log('[Auth logout] Cookie cleared successfully.');
  } catch (e: any) {
    console.error('[Auth logout] CRITICAL: Error deleting cookie:', e.message, e.stack);
    // Not throwing error here to allow redirect to proceed in auth-actions
  }
}

// getCurrentUser now always returns a mock user, bypassing cookie check for direct access.
export async function getCurrentUser(): Promise<User | null> {
  console.log('[Auth getCurrentUser] Bypassing cookie check, returning mock user.');
  return {
    id: MOCK_USER_ID,
    username: 'Usuário Convidado', // Mock username
  };
}
