import { cookies } from 'next/headers';
import type { User } from './types';
import { AUTH_COOKIE_NAME, MOCK_USER_ID, MOCK_USERNAME } from './constants';

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
    console.log('[Auth parseMockToken] Token parsed successfully for user:', parsedUser.username);
    return parsedUser;
  } catch (error: any) {
    console.error('[Auth parseMockToken] Error parsing token. It might be malformed or not base64. Error:', error.message, error.stack);
    return null;
  }
};

export async function login(username: string, password?: string): Promise<User | null> {
  console.log(`[Auth Login Attempt] Username: "${username}", Password: "${password ? '******' : 'undefined'}"`);
  console.log(`[Auth Login Config] MOCK_USERNAME: "${MOCK_USERNAME}"`);

  if (typeof MOCK_USERNAME !== 'string' || MOCK_USERNAME.trim() === '') {
    console.error('[Auth Login Critical] MOCK_USERNAME is not a valid string or is empty. This is a server configuration error.');
    throw new Error('Server configuration error: MOCK_USERNAME is invalid.');
  }

  if (username === MOCK_USERNAME && password === MOCK_USERNAME) {
    console.log('[Auth Login Success] Credentials match for user:', username);
    const userPayload: Omit<User, 'id'> = { username };
    let token: string;
    
    try {
      token = createMockToken(userPayload);
    } catch (e: any) {
      console.error('[Auth Login Critical] Error calling createMockToken:', e.message, e.stack);
      // This re-throw will be caught by auth-actions.ts login
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
      // This could happen if `cookies()` is not available in this context, though it should be in a server component/action.
      throw new Error('Server error during authentication session setup.');
    }
    
    return { ...userPayload, id: MOCK_USER_ID };
  }
  
  console.log('[Auth Login Failure] Credentials do not match criteria.');
  return null;
}

export async function logout(): Promise<void> {
  console.log('[Auth logout] Attempting to clear cookie:', AUTH_COOKIE_NAME);
  try {
    cookies().delete(AUTH_COOKIE_NAME);
    console.log('[Auth logout] Cookie cleared successfully.');
  } catch (e: any) {
    console.error('[Auth logout] CRITICAL: Error deleting cookie:', e.message, e.stack);
    throw new Error('Server error during logout process.');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // console.log(`[Auth getCurrentUser] Attempting to get current user. Cookie name: ${AUTH_COOKIE_NAME}`);
  let token: string | undefined;
  try {
    const cookie = cookies().get(AUTH_COOKIE_NAME);
    token = cookie?.value;
  } catch (e: any) {
     console.error('[Auth getCurrentUser] CRITICAL: Error fetching cookie:', e.message, e.stack);
     return null; // Fail gracefully if cookies cannot be read
  }
  
  // console.log(`[Auth getCurrentUser] Token from cookie: ${token ? token.substring(0, 10) + '...' : 'None'}`);

  if (token) {
    // parseMockToken already has its own try-catch and logging
    const user = parseMockToken(token);
    // console.log(`[Auth getCurrentUser] User parsed from token: ${user ? user.username : 'None (parsing failed or no username)'}`);
    return user;
  }
  // console.log('[Auth getCurrentUser] No token found.');
  return null;
}