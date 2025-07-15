
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
// import { createClient } from '@supabase/supabase-js'; // Supabase temporarily disabled

// Define the input schema for user login
export const UserLoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;

// Define the output schema for a successful login.
export const UserLoginOutputSchema = z.object({
    user: z.any().describe("The full user profile object from the database."),
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
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // );
    
    // Instead of signing in, we just fetch the user profile by email from the 'profiles' table
    // const { data: profile, error } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('email', input.email)
    //   .single();


    // if (error || !profile) {
    //   // This is the error that will be sent back to the client
    //   throw new Error('Usuário não encontrado.');
    // }

    // NOTE: This flow is temporarily disabled and will not be called
    // The logic is now handled directly in AuthContext with mock data.
    // This is a placeholder to avoid breaking the build.
    throw new Error('Supabase integration is temporarily disabled.');


    // Return the user profile data.
    // return {
    //   user: profile,
    // };
  }
);
