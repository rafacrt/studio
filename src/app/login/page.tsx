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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerHapticFeedback } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoadingAuth } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    triggerHapticFeedback();
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Please check your credentials and try again.",
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
            Sign in to Alugo
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-card p-6 shadow-lg sm:p-8">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={`mt-1 ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="you@example.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className={`pr-10 ${errors.password ? 'border-destructive focus:ring-destructive' : ''}`}
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingAuth}>
              {isLoadingAuth ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Inspired by Airbnb, designed for iOS.
        </p>
      </div>
    </div>
  );
}
