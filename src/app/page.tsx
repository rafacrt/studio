

import Link from 'next/link';
// import { Loader2 } from 'lucide-react'; // Using Bootstrap spinner

export default function HomePage() {
  return (
    // Use Bootstrap classes for centering and layout
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 flex-grow-1 py-5 text-center p-4">
      <h1 className="h2 fw-bold mb-3">Página Inicial de Teste (Simplificada)</h1>
      <p className="fs-5 text-muted mb-4">
        Se você está vendo esta mensagem, a rota principal (/) está funcionando.
      </p>
      <p className="small text-muted mb-5">
        Clique no botão abaixo para tentar acessar o painel de controle.
      </p>

      <Link href="/dashboard" passHref legacyBehavior>
        <a className="btn btn-primary btn-lg"> {/* Bootstrap button */}
          Ir para o Painel de Controle
        </a>
      </Link>

       <div className="mt-5 pt-4 d-flex flex-column align-items-center">
           <div className="spinner-border text-primary mb-3" role="status" style={{width: '2rem', height: '2rem'}}>
             <span className="visually-hidden">Loading...</span>
           </div>
           <p className="small text-muted">Simulando carregamento da página inicial...</p>
       </div>
    </div>
  );
}
