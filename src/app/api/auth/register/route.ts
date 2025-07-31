import { NextResponse } from 'next/server';
import { registerUser, UserRegistrationInputSchema } from '@/packages/api/flows/user-registration-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body against the Zod schema
    const validationResult = UserRegistrationInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input.', details: validationResult.error.flatten() }, { status: 400 });
    }

    // Call the registration flow with the validated data
    const result = await registerUser(validationResult.data);

    return NextResponse.json(result, { status: 201 }); // 201 Created for successful registration
  } catch (error: any) {
    // Handle errors from the flow (e.g., user already exists)
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}