import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/auth/logout
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!token) {
    // Even without a token, we can return a success to ensure the client logs out.
    // The main purpose is client-side state clearing.
    return NextResponse.json({ message: 'Logged out locally.' }, { status: 200 });
  }
  
  // Invalidate the token on the server
  const { error } = await supabase.auth.signOut({ jwt: token });

  if (error) {
    // We don't want to block the client from logging out if the server fails,
    // but we should log the error.
    console.error('Supabase sign out error:', error);
    return NextResponse.json({ error: 'Failed to invalidate token on server.', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Successfully logged out.' }, { status: 200 });
}
