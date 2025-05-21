
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PostLoginAnimation from '@/components/layout/PostLoginAnimation';
import OSGrid from '@/components/os-grid/OSGrid';
import { CreateOSDialog } from '@/components/os/CreateOSDialog';
import { Calendar, Building, FileText as ReportIcon, Users } from 'lucide-react';
import type { User } from '@/lib/types'; // Import User type
// Não podemos chamar getSession() diretamente em Client Component.
// O usuário deve ser obtido de outra forma ou o layout ajustado.

// Session storage key
const ANIMATION_PLAYED_KEY = 'freelaos_animation_played';

export default function DashboardPage() {
  // O usuário 'user' para AuthenticatedLayout e Header deve vir de um Server Component.
  // Como esta página é um Client Component, não podemos chamar getSession() aqui.
  // O AuthenticatedLayout foi ajustado para não depender mais de getSession() internamente.
  // A prop 'user' para o Header dentro de AuthenticatedLayout precisa ser populada de um contexto ou
  // de uma chamada API/Server Action se o Header precisar dela e for renderizado por um Client Component.
  // Para este exemplo, o AuthenticatedLayout já recebe o `user` via props, que deve ser passado por um Server Component que o renderiza.
  // Se DashboardPage fosse um Server Component, poderíamos fazer:
  // const user = await getSession();
  // E passar `user` para `AuthenticatedLayout`.

  const [isClient, setIsClient] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const animationPlayed = sessionStorage.getItem(ANIMATION_PLAYED_KEY);
      if (animationPlayed !== 'true') {
        setShowAnimation(true);
      } else {
        setShowAnimation(false);
      }
    } catch (error) {
      console.warn("Session storage not available or error accessing it:", error);
      setShowAnimation(false);
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    try {
      sessionStorage.setItem(ANIMATION_PLAYED_KEY, 'true');
    } catch (error) {
      console.warn("Error setting session storage:", error);
    }
  };

  if (!isClient) {
    return (
      <AuthenticatedLayout>
        <div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
           <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Carregando...</span>
           </div>
          <p className="mt-3 text-muted fs-5">Carregando painel...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (showAnimation) {
    return (
      <AuthenticatedLayout>
        <PostLoginAnimation onAnimationComplete={handleAnimationComplete} />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-2">
        <h1 className="h3 mb-0 me-auto">Ordens de Serviço</h1>
         <div className="d-flex gap-2 flex-wrap">
            <Link href="/calendar" className="btn btn-sm btn-outline-secondary">
                <Calendar size={16} className="me-1" /> Calendário
            </Link>
             <Link href="/entities" className="btn btn-sm btn-outline-info">
                 <Users size={16} className="me-1" /> Entidades
             </Link>
              <Link href="/reports" className="btn btn-sm btn-outline-warning">
                 <ReportIcon size={16} className="me-1" /> Relatórios
             </Link>
            <CreateOSDialog />
        </div>
      </div>
      <OSGrid />
    </AuthenticatedLayout>
  );
}
