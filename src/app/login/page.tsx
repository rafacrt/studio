
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import AppLogo from '@/components/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, adminLogin, isAuthenticated, isAdmin, isLoadingAuth, isAnimatingLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });
  
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast({
        title: message.startsWith("Logout") ? "Até logo!" : "Atenção",
        description: message,
        variant: message.startsWith("Logout") ? "default" : "destructive",
        className: message.startsWith("Logout") ? "bg-accent text-accent-foreground" : "",
      });
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, toast, router]);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const targetRoute = isAdmin ? '/admin' : '/explore';
      router.replace(targetRoute);
    }
  }, [isAuthenticated, isAdmin, isLoadingAuth, router]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    await login(data.email);
    setIsSubmitting(false);
  };

  const handleAdminSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    await adminLogin(data.email);
    setIsSubmitting(false);
  };
  
  const isLoading = isSubmitting || isAnimatingLogin;

  if (isLoadingAuth || (isAuthenticated && !isAnimatingLogin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <AppLogo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Bem-vindo(a)!</CardTitle>
          <CardDescription className="text-muted-foreground">Acesse sua conta para encontrar seu próximo quarto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com ou admin@westudy.com"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 pt-6">
           <p className="text-sm text-muted-foreground">Ou</p>
            <Button
                onClick={handleSubmit(handleAdminSubmit)}
                variant="outline"
                className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary py-3"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Entrar como Administrador
            </Button>
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
