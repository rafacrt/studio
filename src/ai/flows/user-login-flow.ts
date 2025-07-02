'use server';
/**
 * @fileOverview User login flow.
 *
 * - loginUser - A function that handles user authentication.
 * - UserLoginInput - The input type for the loginUser function.
 * - UserLoginOutput - The return type for the loginUser function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the input schema for user login
export const UserLoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;

// Define the output schema for a successful login.
// We return the user and session objects from Supabase, which contain tokens needed by the mobile client.
export const UserLoginOutputSchema = z.object({
    user: z.any().describe("The full user object from Supabase."),
    session: z.any().describe("The session object, containing access and refresh tokens.")
});
export type UserLoginOutput = z.infer<typeof UserLoginOutputSchema>;


// Exported wrapper function to be called from API routes or server actions
export async function loginUser(input: UserLoginInput): Promise<UserLoginOutput> {
  return userLoginFlow(input);
}

// Define the Genkit flow for user login
const userLoginFlow = ai.defineFlow(
  {
    name: 'userLoginFlow',
    inputSchema: UserLoginInputSchema,
    outputSchema: UserLoginOutputSchema,
  },
  async (input) => {
    // This client is safe for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      // Use a more specific error for invalid credentials
      if (error.message === 'Invalid login credentials') {
          throw new Error('Email ou senha inválidos.');
      }
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
        throw new Error('Falha no login: dados de usuário ou sessão não retornados.');
    }

    // For an API client (like a mobile app), we must return the session data.
    return {
      user: data.user,
      session: data.session,
    };
  }
);
