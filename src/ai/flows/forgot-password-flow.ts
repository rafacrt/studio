'use server';
/**
 * @fileOverview Flow para redefinição de senha.
 *
 * - requestPasswordReset - Envia um email de redefinição de senha para o usuário.
 * - ForgotPasswordInput - O tipo de entrada para a função.
 * - ForgotPasswordOutput - O tipo de retorno da função.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define o schema de entrada para a redefinição de senha
export const ForgotPasswordInputSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

// Define o schema de saída para a operação
export const ForgotPasswordOutputSchema = z.object({
  message: z.string(),
});
export type ForgotPasswordOutput = z.infer<typeof ForgotPasswordOutputSchema>;

// Função wrapper exportada para ser chamada pelas rotas da API
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
  return forgotPasswordFlow(input);
}

// Define o Genkit Flow para lidar com a lógica de redefinição de senha
const forgotPasswordFlow = ai.defineFlow(
  {
    name: 'forgotPasswordFlow',
    inputSchema: ForgotPasswordInputSchema,
    outputSchema: ForgotPasswordOutputSchema,
  },
  async (input) => {
    // Cliente Supabase seguro para operações no lado do servidor
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.auth.resetPasswordForEmail(input.email);

    if (error) {
      // Log do erro no servidor para debugging, mas não exponha detalhes ao cliente
      console.error('Erro na redefinição de senha do Supabase:', error.message);
      // Lança um erro genérico para ser capturado pela API
      throw new Error('Não foi possível enviar o email de redefinição de senha.');
    }

    // Por razões de segurança, sempre retorne uma mensagem de sucesso genérica
    // para não revelar se um email está ou não cadastrado no sistema.
    return {
      message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.',
    };
  }
);
