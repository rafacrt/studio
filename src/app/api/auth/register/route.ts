import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          // O avatar_url pode ser adicionado aqui ou atualizado mais tarde no perfil.
          // avatar_url: 'URL_DO_AVATAR_PADRAO'
        },
      },
    });

    if (error) {
      // Códigos de erro comuns do Supabase Auth
      if (error.message.includes("User already registered")) {
        return NextResponse.json({ error: 'Um usuário com este e-mail já existe.' }, { status: 409 });
      }
       if (error.message.includes("Password should be at least 6 characters")) {
        return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
      }
      console.error('Supabase registration error:', error);
      return NextResponse.json({ error: 'Erro ao registrar usuário.', details: error.message }, { status: 500 });
    }

    if (!data.user) {
        return NextResponse.json({ error: 'Não foi possível criar o usuário. Tente novamente.' }, { status: 500 });
    }

    // O trigger no banco de dados (`handle_new_user`) irá criar o perfil na tabela `profiles`.
    return NextResponse.json({ 
        id: data.user.id, 
        email: data.user.email 
    }, { status: 201 });

  } catch (err: any) {
    console.error('API Register Error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
