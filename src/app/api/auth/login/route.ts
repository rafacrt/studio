import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
       // O Supabase retorna um erro genérico 'Invalid login credentials' para ambos os casos
       // por razões de segurança, para não informar se um e-mail existe ou não.
      return NextResponse.json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }, { status: 401 });
    }

    // A sessão é definida em um cookie httpOnly pelo Supabase SSR.
    // O lado do cliente será notificado da mudança de estado de autenticação.
    return NextResponse.json({ user: data.user, session: data.session }, { status: 200 });
    
  } catch (err: any) {
    console.error('API Login Error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
