'use server';
/**
 * @fileOverview User registration flow - TEMPORARIAMENTE DESABILITADO
 */
import { z } from 'zod';
import { randomUUID } from 'crypto';

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
  // Simula uma resposta sem usar o Genkit
  return Promise.resolve({
    id: randomUUID(),
    email: input.email,
  });
}