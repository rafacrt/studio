
'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, Building, Users } from 'lucide-react';
import { useOSStore } from '@/store/os-store';

export default function EntitiesPage() {
  const partners = useOSStore((state) => state.partners);
  const [isHydrated, setIsHydrated] = useState(false);

   useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Note: Client management is not implemented yet, only listing partners from OS data.

  return (
    <AuthenticatedLayout>
       <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <h1 className="h3 mb-0">Entidades</h1>
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
                <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
       </div>

        <div className="row">
            {/* Partners Column */}
            <div className="col-md-6">
                <div className="card shadow-sm mb-4">
                    <div className="card-header d-flex align-items-center">
                        <Users size={18} className="me-2 text-primary" />
                        <h2 className="h5 mb-0 card-title">Parceiros</h2>
                    </div>
                    <div className="card-body">
                        {isHydrated ? (
                            partners.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {partners.map((partner) => (
                                        <li key={partner} className="list-group-item d-flex justify-content-between align-items-center">
                                            {partner}
                                            {/* Add edit/delete buttons in the future if needed */}
                                            {/* <button className="btn btn-sm btn-outline-secondary disabled">Editar</button> */}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted text-center">Nenhum parceiro registrado nas Ordens de Serviço ainda.</p>
                            )
                        ) : (
                             <div className="d-flex justify-content-center">
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Carregando parceiros...</span>
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="card-footer text-muted small">
                         Lista de parceiros únicos encontrados nas OS.
                    </div>
                </div>
            </div>

             {/* Clients Column (Placeholder) */}
             <div className="col-md-6">
                 <div className="card shadow-sm mb-4">
                     <div className="card-header d-flex align-items-center">
                        <Building size={18} className="me-2 text-success" />
                        <h2 className="h5 mb-0 card-title">Clientes</h2>
                    </div>
                    <div className="card-body">
                        <p className="text-muted text-center">
                            Gerenciamento de clientes ainda não implementado.
                            <br/>
                            <small>(Os nomes dos clientes são atualmente gerenciados dentro de cada OS)</small>
                        </p>
                    </div>
                     <div className="card-footer text-muted small">
                         Recurso Futuro: Gerenciamento de Clientes
                    </div>
                 </div>
            </div>
        </div>


    </AuthenticatedLayout>
  );
}
