
import { cookies } from 'next/headers';
import type { User } from './types';
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE } from './constants';
import { SignJWT, jwtVerify } from 'jose';
import type { RowDataPacket } from 'mysql2/promise';
import db from './db'; // Importa a pool de conexão do banco

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-fallback-super-secret-key-32-chars');
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn(
    'Warning: JWT_SECRET is not set in environment variables. Using a fallback secret. This is NOT secure for production.'
  );
}


export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(AUTH_COOKIE_NAME);
  if (!sessionCookie?.value) {
    console.log('[Auth getSession] No session cookie found.');
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    // payload deve conter o ID do usuário e username
    if (payload.sub && typeof payload.username === 'string') {
      console.log(`[Auth getSession] Session valid for user ID: ${payload.sub}, Username: ${payload.username}`);
      return { id: payload.sub, username: payload.username };
    }
    console.warn('[Auth getSession] JWT payload malformed or missing sub/username.');
    return null;
  } catch (error) {
    console.error('[Auth getSession] Invalid or expired JWT:', error);
    // Se o token for inválido ou expirado, limpe o cookie
    await clearSession();
    return null;
  }
}

export async function createSession(userId: string, username: string): Promise<void> {
  const expirationTime = new Date(Date.now() + SESSION_MAX_AGE * 1000); // ms
  const token = await new SignJWT({ username }) // Adiciona username ao payload
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);

  cookies().set(AUTH_COOKIE_NAME, token, {
    expires: expirationTime,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  console.log(`[Auth createSession] Session cookie created for user ID: ${userId}`);
}

export async function clearSession(): Promise<void> {
  cookies().delete(AUTH_COOKIE_NAME);
  console.log('[Auth clearSession] Session cookie cleared.');
}

// Função para obter usuário diretamente do cookie (usada em Client Components ou onde `cookies()` não está disponível diretamente)
// Importante: Chamar Server Actions para operações que exigem `cookies()`
export async function getCurrentUser(): Promise<User | null> {
  return await getSession(); // getSession já usa cookies()
}

// Função para buscar usuário no banco pelo username (usada pela action de login)
export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  const connection = await db.getConnection();
  try {
    console.log(`[Auth getUserByUsername] Fetching user: ${username}`);
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    if (rows.length > 0) {
      const userFromDb = rows[0];
      console.log(`[Auth getUserByUsername] User found: ID ${userFromDb.id}`);
      return {
        id: String(userFromDb.id),
        username: userFromDb.username,
        password_hash: userFromDb.password_hash,
      };
    }
    console.log(`[Auth getUserByUsername] User "${username}" not found.`);
    return null;
  } catch (error: any) {
    console.error(`[Auth getUserByUsername] Error fetching user "${username}":`, error);
    throw new Error('Database error while fetching user.');
  } finally {
    if (connection) connection.release();
  }
}
