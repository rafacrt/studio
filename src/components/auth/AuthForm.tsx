
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
// No longer need useRouter for client-side redirect on login

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
// User type might not be directly needed from server action response if redirecting
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
    setIsLoading(true);
    console.log('[AuthForm] Submitting login form with values:', {username: values.username, password: values.password ? '******' : 'undefined'});
    try {
      // The `login` server action will redirect on success or return null on auth failure.
      // It throws an error for other server-side issues.
      const result = await login(values.username, values.password);

      // If execution reaches here, the server action did not redirect successfully.
      // This means login failed (result is null).
      if (result === null) {
        toast({
          title: 'Falha no Login',
          description: 'Nome de usuário ou senha inválidos.',
          variant: 'destructive',
        });
      }
      // If login was successful, the server action redirects, and this part of the code (after await)
      // might not be reached, or the component might unmount before it processes.
      // No client-side redirect (e.g., router.push) is needed here.
      // No success toast is needed here as the user will be redirected to the dashboard.

    } catch (error: any) { 
      console.error("[AuthForm] Login error object:", error);

      // Check if the error is due to NEXT_REDIRECT, which Next.js should handle.
      // Application code typically doesn't need to catch NEXT_REDIRECT.
      // If it's caught here, it implies an unexpected scenario or a different type of error.
      if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
        // This block might not be strictly necessary as Next.js handles redirect errors.
        // However, logging it can be useful for debugging.
        console.log('[AuthForm] NEXT_REDIRECT signal caught, browser should redirect.');
        // Optionally, show a generic "Redirecting..." message, though usually not needed.
        // toast({ title: 'Redirecionando...', description: 'Aguarde...' });
      } else {
        // Handle other errors (e.g., server unavailable, non-auth related issues)
        toast({
          title: 'Erro no Login',
          description: error.message || 'Falha ao processar o login. Verifique sua conexão ou tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    } finally {
      // Set loading to false if login failed or an error occurred.
      // If a redirect is happening, the component will unmount, so this state change might not be visible
      // or might execute just before unmounting. It's generally safe to include.
      setIsLoading(false);
    }
  }

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
