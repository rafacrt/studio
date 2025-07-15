import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a helper function to create a Supabase client that can act on behalf of the user
// by using the JWT from the Authorization header.
const createSupabaseClient = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  return { supabase, token };
};

// GET /api/auth/me - Fetches the current user's profile
export async function GET(request: Request) {
  const { supabase, token } = createSupabaseClient(request);

  if (!token) {
    return NextResponse.json({ error: 'Authorization token is required.' }, { status: 401 });
  }

  // supabase.auth.getUser() will use the token from the client's headers
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Invalid token.' }, { status: 401 });
  }

  // Fetch the corresponding profile from the 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    return NextResponse.json({ error: 'Profile not found.', details: profileError.message }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PUT /api/auth/me - Updates the current user's profile
export async function PUT(request: Request) {
  const { supabase, token } = createSupabaseClient(request);
  
  if (!token) {
    return NextResponse.json({ error: 'Authorization token is required.' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Invalid token.' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required and must be a string.' }, { status: 400 });
  }

  // Step 1: Update the user's metadata in the auth schema
  const { data: updatedUser, error: updateUserError } = await supabase.auth.updateUser({
    data: { name: name }
  });

  if (updateUserError) {
    return NextResponse.json({ error: 'Failed to update user auth data.', details: updateUserError.message }, { status: 500 });
  }
  
  // Step 2: Update the user's profile in the public profiles table
  const { data: updatedProfile, error: profileError } = await supabase
    .from('profiles')
    .update({ name: name })
    .eq('id', user.id)
    .select()
    .single();

  if (profileError) {
     return NextResponse.json({ error: 'Failed to update user profile.', details: profileError.message }, { status: 500 });
  }

  return NextResponse.json(updatedProfile);
}
