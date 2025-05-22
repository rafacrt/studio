// src/lib/auth-edge.ts
// This file contains authentication logic that is safe to run in the Edge Runtime.
// It does NOT include database interactions.

import type { User } from './types';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET;

if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is not set. Please add it to your .env.local file.');
}
const key = new TextEncoder().encode(JWT_SECRET_KEY);

export async function encryptPayload(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(key);
}

export async function decryptPayload(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('[Auth-Edge decryptPayload] Failed to verify JWT or token expired:', error);
    return null;
  }
}

export async function getSessionFromToken(tokenValue?: string): Promise<User | null> {
  if (!tokenValue) {
    return null;
  }

  const decryptedPayload = await decryptPayload(tokenValue);
  if (!decryptedPayload || !decryptedPayload.userId) {
    return null;
  }

  return {
    id: decryptedPayload.userId as string,
    username: decryptedPayload.username as string,
    isAdmin: decryptedPayload.isAdmin as boolean,
    isApproved: decryptedPayload.isApproved as boolean,
  };
}
