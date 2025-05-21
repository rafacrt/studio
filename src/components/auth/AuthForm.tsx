
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login } from '@/lib/actions/auth-actions';
import { useRouter } from 'next/navigation'; // Para redirecionamento após login

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Usuário é obrigatório.' }),
  password_hash: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password_hash: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    console.log('[AuthForm] Submitting login form with values:', { username: values.username, password_hash: '********' });

    try {
      const result = await login(values);
      console.log('[AuthForm] Login action result:', result);

      if (result?.error) {
        setFormError(result.error);
        setIsSubmitting(false);
      } else {
        // Login bem-sucedido, Server Action `login` já redireciona.
        // Se não redirecionasse, faríamos aqui:
        // router.push('/dashboard');
        // O setIsSubmitting(false) pode não ser necessário se o redirecionamento for rápido
      }
    } catch (error: any) {
      console.error("[AuthForm] Error caught during login action call. Message:", error.message, "Digest:", error.digest, "Error object:", error);
      
      // NEXT_REDIRECT é um erro que o Next.js lança internamente ao usar redirect() em Server Actions.
      // Não é um erro "real" para o usuário, mas sim a forma como o redirect funciona.
      // O framework trata esse erro e executa o redirecionamento.
      const isRedirectError = error.digest?.includes('NEXT_REDIRECT');

      if (!isRedirectError) {
        setFormError('Ocorreu um erro inesperado. Tente novamente.');
      }
      // Se for um erro de redirecionamento, não precisamos fazer nada aqui, o Next.js cuidará disso.
      // Apenas resetamos o isSubmitting se NÃO for um erro de redirect, para permitir nova tentativa.
      if (!isRedirectError) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError && (
        <div className="alert alert-danger small py-2" role="alert">
          {formError}
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="username" className="form-label">Usuário</label>
        <input
          type="text"
          id="username"
          className={`form-control ${form.formState.errors.username ? 'is-invalid' : ''}`}
          placeholder="Seu nome de usuário"
          {...form.register('username')}
          disabled={isSubmitting}
        />
        {form.formState.errors.username && (
          <div className="invalid-feedback">{form.formState.errors.username.message}</div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="password_hash" className="form-label">Senha</label>
        <input
          type="password"
          id="password_hash"
          className={`form-control ${form.formState.errors.password_hash ? 'is-invalid' : ''}`}
          placeholder="Sua senha"
          {...form.register('password_hash')}
          disabled={isSubmitting}
        />
        {form.formState.errors.password_hash && (
          <div className="invalid-feedback">{form.formState.errors.password_hash.message}</div>
        )}
      </div>
      {/* Futuramente, link para "Esqueci minha senha"
      <div className="mb-3 text-end">
        <Link href="/forgot-password" passHref legacyBehavior>
          <a className="text-decoration-none small">Esqueceu a senha?</a>
        </Link>
      </div>
      */}
      <button type="submit" className="btn btn-primary w-100" disabled={!form.formState.isValid || isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Entrando...
          </>
        ) : 'Entrar'}
      </button>
    </form>
  );
}
