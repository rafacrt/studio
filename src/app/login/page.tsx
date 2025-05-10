
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AppLogo } from '@/components/AppLogo';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerHapticFeedback } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { mockAdminUser } from '@/lib/mock-data'; // Import mockAdminUser

const loginSchema = z.object({
  email: z.string().email({ message: "Endereço de e-mail inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    triggerHapticFeedback();
    try {
      await login(data.email, data.password);
      // Redirection and animation are handled within AuthContext
    } catch (error) {
      toast({
        title: "Falha no Login",
        description: (error as Error).message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogin = async () => {
    triggerHapticFeedback();
    try {
      // Use mockAdminUser.email and a dummy password
      await login(mockAdminUser.email, 'adminpassword'); 
    } catch (error) {
      toast({
        title: "Falha no Login como Admin",
        description: (error as Error).message || "Não foi possível logar como administrador.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <AppLogo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Acesse sua conta WeStudy
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-card p-6 shadow-lg sm:p-8">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Endereço de e-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={`mt-1 ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="seuemail@exemplo.com"
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isLoadingAuth || isSubmitting}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className={`pr-10 ${errors.password ? 'border-destructive focus:ring-destructive' : ''}`}
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
                disabled={isLoadingAuth || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                disabled={isLoadingAuth || isSubmitting}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingAuth || isSubmitting}>
              {(isLoadingAuth || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </div>
        </form>

        <div className="space-y-4">
            <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAdminLogin} 
                disabled={isLoadingAuth || isSubmitting}
            >
                 {(isLoadingAuth || isSubmitting) && loginSchema.safeParse({email: mockAdminUser.email, password: 'adminpassword'}).success && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ShieldCheck className="mr-2 h-4 w-4" />
                Entrar como Administrador
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Encontre o quarto ideal para sua vida universitária.
            </p>
        </div>

      </div>
    </div>
  );
}
