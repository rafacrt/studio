'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/lib/auth-actions'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Nome de usuário é obrigatório.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }), 
});

type LoginFormValues = z.infer<typeof formSchema>;

export function AuthForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    console.log('[AuthForm] onSubmit started. Current isLoading:', isLoading);
    setIsLoading(true);
    console.log('[AuthForm] setIsLoading(true) called. New isLoading:', true);
    console.log('[AuthForm] Submitting login form with values:', {username: values.username, password: values.password ? '******' : 'undefined'});
    
    try {
      console.log('[AuthForm] Calling await login server action.');
      const result = await login(values.username, values.password);
      console.log('[AuthForm] Server action result (if no redirect/error):', result);

      if (result === null) {
        console.log('[AuthForm] Login failed (result is null). Displaying toast.');
        toast({
          title: 'Falha no Login',
          description: 'Nome de usuário ou senha inválidos.',
          variant: 'destructive',
        });
      } else if (result !== undefined) {
        // This case should ideally not be hit if successful login always redirects.
        // If it does, it implies a successful login didn't redirect.
        console.warn('[AuthForm] Server action returned an unexpected result (not null, not redirected):', result);
      }
      // If login was successful, the server action redirects.
      // Code here might not be reached if redirection is successful and component unmounts.
      console.log('[AuthForm] Try block finished processing server action result.');

    } catch (error: any) { 
      console.error("[AuthForm] Error caught during login action call. Error message:", error.message, "Error digest:", error.digest, "Full error object:", error);

      const isRedirectError = error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT');

      if (isRedirectError) {
        console.log('[AuthForm] NEXT_REDIRECT signal caught by AuthForm. Browser should be handling the redirect.');
        // No toast needed here as browser should redirect.
      } else {
        // Handle other errors (e.g., server unavailable, non-auth related issues)
        console.log('[AuthForm] Non-redirect error. Displaying error toast.');
        toast({
          title: 'Erro no Login',
          description: error.message || 'Falha ao processar o login. Verifique sua conexão ou tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    } finally {
      console.log('[AuthForm] Reached finally block.');
      setIsLoading(false);
      console.log('[AuthForm] setIsLoading(false) called in finally. New isLoading:', false);
    }
  }

  console.log('[AuthForm] Rendering. Current isLoading state:', isLoading);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.75 2.75H4.75C3.64543 2.75 2.75 3.64543 2.75 4.75V9.75C2.75 10.8546 3.64543 11.75 4.75 11.75H9.75C10.8546 11.75 11.75 10.8546 11.75 9.75V4.75C11.75 3.64543 10.8546 2.75 9.75 2.75Z"></path><path d="M19.25 2.75H14.25C13.1454 2.75 12.25 3.64543 12.25 4.75V9.75C12.25 10.8546 13.1454 11.75 14.25 11.75H19.25C20.3546 11.75 21.25 10.8546 21.25 9.75V4.75C21.25 3.64543 20.3546 2.75 19.25 2.75Z"></path><path d="M9.75 12.25H4.75C3.64543 12.25 2.75 13.1454 2.75 14.25V19.25C2.75 20.3546 3.64543 21.25 4.75 21.25H9.75C10.8546 21.25 11.75 20.3546 11.75 19.25V14.25C11.75 13.1454 10.8546 12.25 9.75 12.25Z"></path><path d="M15.75 18.25H12.75V15.25H15.75V18.25Z"></path><path d="M18.25 15.75H15.75V12.75H18.25V15.75Z"></path><path d="M21.25 15.75H18.25V12.75H21.25V15.75Z"></path><path d="M21.25 18.25H18.25V15.25H21.25V18.25Z"></path><path d="M15.75 21.25H12.75V18.25H15.75V21.25Z"></path><path d="M18.25 21.25H15.75V18.25H18.25V21.25Z"></path><path d="M21.25 21.25H18.25V18.25H21.25V21.25Z"></path></svg>
        </div>
        <CardTitle className="text-3xl font-bold">FreelaOS Minimal</CardTitle>
        <CardDescription>Entre para acessar seu painel.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Use 'admin' para logar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
