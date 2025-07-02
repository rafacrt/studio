"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import AppLogo from '@/components/AppLogo';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao enviar o link de redefinição.');
      }
      
      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <AppLogo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Esqueceu a senha?</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSuccess 
              ? "Verifique sua caixa de entrada." 
              : "Sem problemas! Digite seu email e enviaremos um link para redefinir sua senha."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <MailCheck className="h-16 w-16 text-green-600 mb-4" />
              <p className="text-green-800 dark:text-green-300">
                Enviamos um link de redefinição para o seu e-mail. Por favor, siga as instruções para criar uma nova senha.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enviar Link de Redefinição"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline flex items-center">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
