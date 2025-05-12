
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle } from 'lucide-react';
// Not using AuthenticatedLayout here as it's a public login page

export default function WorkflowLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('workflowUserRole', 'admin');
        localStorage.removeItem('workflowClientId'); // Clear client ID if admin logs in
        router.push('/workflow/admin');
      } else if (username === 'cliente' && password === 'cliente') {
        localStorage.setItem('workflowUserRole', 'client');
        // For simplicity, hardcoding a client ID. In a real app, this would come from the backend.
        localStorage.setItem('workflowClientId', 'client-mock-id-1');
        localStorage.setItem('workflowClientName', 'Cliente Exemplo 1');
        router.push('/workflow/approval');
      } else {
        setError('Usuário ou senha inválidos.');
        setIsLoading(false);
      }
      // No need to setIsLoading(false) on success as router.push will navigate away
    }, 500);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <LogIn size={48} className="text-primary mb-2" />
            <h1 className="h3 mb-1 fw-bold">Acesso ao Workflow</h1>
            <p className="text-muted small">Entre com suas credenciais.</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center p-2" role="alert">
              <AlertCircle size={20} className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Usuário</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin ou cliente"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="admin ou cliente"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
           <div className="mt-3 text-center">
              <button onClick={() => router.push('/')} className="btn btn-link btn-sm">
                Voltar para Início
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
