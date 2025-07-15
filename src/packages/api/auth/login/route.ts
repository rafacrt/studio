import { NextResponse } from 'next/server';
import { loginUser, UserLoginInputSchema } from '@/packages/api/flows/user-login-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body against the Zod schema
    const validationResult = UserLoginInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Input inválido.', details: validationResult.error.flatten() }, { status: 400 });
    }

    // Call the login flow with the validated data
    const result = await loginUser(validationResult.data);

    // The mobile app will receive the user and session objects, including the JWTs.
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    // Handle specific errors from the flow (e.g., invalid credentials)
     if (error.message.includes('Usuário não encontrado')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
     }
    // Handle other generic errors
    return NextResponse.json({ error: error.message || 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
