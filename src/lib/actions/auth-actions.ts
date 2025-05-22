
'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { getUserByUsername, createSession, clearSession } from '@/lib/auth';
import type { LoginFormData } from '@/lib/types';

export async function login(formData: LoginFormData): Promise<{ error?: string }> {
  console.log('[AuthAction login] Attempting login for username:', formData.username);
  try {
    const user = await getUserByUsername(formData.username);

    if (!user) {
      console.log('[AuthAction login] User not found:', formData.username);
      return { error: 'Usuário ou senha inválidos.' };
    }

    const passwordMatch = await bcrypt.compare(formData.password_hash, user.password_hash);

    if (!passwordMatch) {
      console.log('[AuthAction login] Password mismatch for user:', formData.username);
      return { error: 'Usuário ou senha inválidos.' };
    }

    await createSession(user.id, user.username);
    console.log('[AuthAction login] Login successful, session created for:', user.username);

  } catch (error: any) {
    console.error('[AuthAction login] Error during login process:', error);
    if (error.message?.includes('NEXT_REDIRECT')) { // Não tratar redirect como um erro fatal
      throw error;
    }
    // Verifica especificamente por erros de conexão com o banco
    if (error.message && (error.message.includes('ECONNREFUSED') || error.message.toLowerCase().includes('database error'))) {
        console.error('[AuthAction login] Database connection error detected:', error.message);
        return { error: 'Falha ao conectar ao banco de dados. Verifique se o servidor MySQL está em execução e configurado corretamente.' };
    }
    return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
  }
  // Se chegou aqui, o login foi bem-sucedido e a sessão foi criada.
  redirect('/dashboard');
}


export async function logout(): Promise<void> {
  console.log('[AuthAction logout] Logging out user.');
  await clearSession();
  redirect('/login');
}
