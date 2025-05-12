
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function CalendarPage() {
  return (
    <AuthenticatedLayout>
       <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Calendário de OS</h1>
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
                <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
       </div>

        <div className="card text-center shadow-sm">
            <div className="card-body p-5">
                <Construction size={48} className="text-warning mb-3" />
                <h2 className="card-title h5">Página em Construção</h2>
                <p className="card-text text-muted">
                    A visualização de calendário para as Ordens de Serviço (baseada nas datas "Programado Para" e "Finalização")
                    está sendo desenvolvida e estará disponível em breve.
                </p>
                 <Link href="/dashboard" className="btn btn-primary mt-3">
                     Voltar ao Painel
                 </Link>
            </div>
             <div className="card-footer text-muted small">
                 Recurso Futuro: Calendário
            </div>
        </div>
    </AuthenticatedLayout>
  );
}
