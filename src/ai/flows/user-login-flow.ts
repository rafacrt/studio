
'use server';
/**
 * @fileOverview User login flow (passwordless).
 *
 * - loginUser - A function that handles user authentication by email.
 * - UserLoginInput - The input type for the loginUser function.
 * - UserLoginOutput - The return type for the loginUser function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the input schema for user login
export const UserLoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  // Password is no longer needed
});
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;

// Define the output schema for a successful login.
// We return the user object, session is no longer needed for the mock flow.
export const UserLoginOutputSchema = z.object({
    user: z.any().describe("The full user object from Supabase."),
    // session: z.any().describe("The session object, containing access and refresh tokens.")
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
    
    // Instead of signing in, we just fetch the user profile by email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', input.email)
      .single();


    if (error || !profile) {
      throw new Error('Usuário não encontrado.');
    }

    // Return the user profile data.
    return {
      user: profile,
    };
  }
);
