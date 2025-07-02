import { NextResponse } from 'next/server';
import { requestPasswordReset, ForgotPasswordInputSchema } from '@/ai/flows/forgot-password-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valida o corpo da requisição com o schema Zod
    const validationResult = ForgotPasswordInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Email inválido.', details: validationResult.error.flatten() }, { status: 400 });
    }

    // Chama o flow para solicitar a redefinição de senha
    const result = await requestPasswordReset(validationResult.data);

    // Retorna a mensagem de sucesso do flow
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    // Retorna um erro genérico para o cliente
    return NextResponse.json({ error: error.message || 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
