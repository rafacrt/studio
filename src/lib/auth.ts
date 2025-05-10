import { cookies } from 'next/headers';
import type { User } from './types';
import { AUTH_COOKIE_NAME, MOCK_USER_ID, MOCK_USERNAME } from './constants';

// Mock JWT: In a real app, use a library like 'jsonwebtoken'
const createMockToken = (user: Omit<User, 'id'>): string => {
  return Buffer.from(JSON.stringify({ ...user, id: MOCK_USER_ID })).toString('base64');
};

const parseMockToken = (token: string): User | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsedUser = JSON.parse(decoded) as User;
    // Ensure the id is present as expected by User type
    if (!parsedUser.id) {
      console.warn('[Auth parseMockToken] Parsed user object is missing an id. Assigning MOCK_USER_ID.');
      // Assign MOCK_USER_ID if missing, though createMockToken should always include it.
      parsedUser.id = MOCK_USER_ID; 
    }
    return parsedUser;
  } catch (error) {
    console.error('[Auth parseMockToken] Error parsing token:', error);
    return null;
  }
};

export async function login(username: string, password?: string): Promise<User | null> {
  console.log(`[Auth Attempt] Username: "${username}", Password: "${password ? '******' : 'undefined'}"`);
  console.log(`[Auth Config] MOCK_USERNAME: "${MOCK_USERNAME}"`);

  if (username === MOCK_USERNAME && password === MOCK_USERNAME) {
    console.log('[Auth Success] Credentials match for user:', username);
    const userPayload: Omit<User, 'id'> = { username };
    const token = createMockToken(userPayload);
    console.log('[Auth Success] Generated token:', token ? token.substring(0, 20) + '...' : 'null');
    
    cookies().set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax', // Explicitly set SameSite
    });
    console.log('[Auth Success] Cookie set action performed for cookie name:', AUTH_COOKIE_NAME);
    return { ...userPayload, id: MOCK_USER_ID };
  }
  console.log('[Auth Failure] Credentials do not match or other issue.');
  return null;
}

export async function logout(): Promise<void> {
  console.log('[Auth logout] Clearing cookie:', AUTH_COOKIE_NAME);
  cookies().delete(AUTH_COOKIE_NAME);
  console.log('[Auth logout] Cookie cleared.');
}

export async function getCurrentUser(): Promise<User | null> {
  const cookie = cookies().get(AUTH_COOKIE_NAME);
  const token = cookie?.value;
  console.log(`[Auth getCurrentUser] Attempting to get current user. Cookie name: ${AUTH_COOKIE_NAME}`);
  console.log(`[Auth getCurrentUser] Cookie found: ${!!cookie}, Token value: ${token ? token.substring(0, 20) + '...' : 'None'}`);

  if (token) {
    const user = parseMockToken(token);
    console.log(`[Auth getCurrentUser] User parsed from token: Username - ${user ? user.username : 'None (parsing failed or no username)'}, ID - ${user?.id}`);
    return user;
  }
  console.log('[Auth getCurrentUser] No token found or token was empty.');
  return null;
}
