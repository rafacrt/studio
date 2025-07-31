'use server';
/**
 * @fileOverview User login flow - TEMPORARIAMENTE DESABILITADO
 */
import { z } from 'zod';

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
  // Simula uma resposta sem usar o Genkit
  return Promise.resolve({
    user: {
      id: crypto.randomUUID(),
      email: input.email,
      name: "Usuario Teste"
    }
  });
}