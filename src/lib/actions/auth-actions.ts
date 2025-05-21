
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
    return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
  }
  // Se chegou aqui, o login foi bem-sucedido e a sessão foi criada.
  // O redirect deve ocorrer no lado do cliente após a action retornar sem erro.
  // Ou, podemos forçar um redirect aqui, mas isso pode ter implicações com o fluxo do formulário.
  // Por enquanto, vamos deixar o cliente redirecionar.
  // Se quisermos redirecionar aqui, seria:
  redirect('/dashboard');
}


export async function logout(): Promise<void> {
  console.log('[AuthAction logout] Logging out user.');
  await clearSession();
  redirect('/login');
}

// Futuramente, uma action para registrar usuário:
// export async function registerUser(formData: RegisterFormData): Promise<{ error?: string, success?: boolean }> {
//   const { username, password }_hash = formData;
//   // 1. Validar dados (ex: Zod)
//   // 2. Verificar se usuário já existe
//   // 3. Gerar hash da senha com bcrypt
//   // 4. Inserir usuário no banco
//   // 5. Retornar sucesso ou erro
//   return { success: true };
// }
