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
    return JSON.parse(decoded) as User;
  } catch (error) {
    return null;
  }
};

export async function login(username: string, _password?: string): Promise<User | null> {
  // Mock password check - in real app, validate against DB
  if (username === MOCK_USERNAME) { // Allow any password for mock user
    const user: Omit<User, 'id'> = { username };
    const token = createMockToken(user);
    cookies().set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { ...user, id: MOCK_USER_ID };
  }
  return null;
}

export async function logout(): Promise<void> {
  cookies().delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    return parseMockToken(token);
  }
  return null;
}
