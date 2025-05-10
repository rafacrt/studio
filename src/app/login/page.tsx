import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <AuthForm />
       <p className="mt-8 text-sm text-muted-foreground">
        Dica: Use o usuário <code className="bg-muted px-1.5 py-0.5 rounded">admin</code> e qualquer senha.
      </p>
    </main>
  );
}
