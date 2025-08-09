import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase sign out error:', error);
    return NextResponse.json({ error: 'Failed to log out', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Successfully logged out' }, { status: 200 });
}
