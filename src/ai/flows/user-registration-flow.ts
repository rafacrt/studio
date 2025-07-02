'use server';
/**
 * @fileOverview User registration flow.
 *
 * - registerUser - A function that handles new user registration.
 * - UserRegistrationInput - The input type for the registerUser function.
 * - UserRegistrationOutput - The return type for the registerUser function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the input schema for user registration
export const UserRegistrationInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
export type UserRegistrationInput = z.infer<typeof UserRegistrationInputSchema>;

// Define the output schema for a successful registration
export const UserRegistrationOutputSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
});
export type UserRegistrationOutput = z.infer<typeof UserRegistrationOutputSchema>;

// Exported wrapper function to be called from API routes or server actions
export async function registerUser(input: UserRegistrationInput): Promise<UserRegistrationOutput> {
  return userRegistrationFlow(input);
}

// Define the Genkit flow for user registration
const userRegistrationFlow = ai.defineFlow(
  {
    name: 'userRegistrationFlow',
    inputSchema: UserRegistrationInputSchema,
    outputSchema: UserRegistrationOutputSchema,
  },
  async (input) => {
    // This client is safe for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        // Pass additional data that the 'handle_new_user' trigger can use
        data: {
          name: input.name,
        },
      },
    });

    if (error) {
      // Throw an error that can be caught by the calling API route
      throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error('Registration failed: no user data returned.');
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }
);
