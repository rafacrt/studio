
'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, Building, Users, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useOSStore } from '@/store/os-store';
import type { Client } from '@/lib/types';
import type { Partner } from '@/store/os-store'; // Import Partner type
import AddEditClientModal from '@/components/entities/AddEditClientModal';
import AddEditPartnerModal from '@/components/entities/AddEditPartnerModal'; // Import the partner modal

export default function EntitiesPage() {
  // Get managed partners list from the store
  const partners = useOSStore((state) => state.partners);
  const clients = useOSStore((state) => state.clients);
  const deleteClient = useOSStore((state) => state.deleteClient);
  const deletePartner = useOSStore((state) => state.deletePartner); // Get delete action for partners

  const [isHydrated, setIsHydrated] = useState(false);

  // State for Client Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // State for Partner Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
        setIsHydrated(true);
    }, 300); // 0.3 second delay
    return () => clearTimeout(timer);
  }, []);

  // --- Client Actions ---
  const openAddClientModal = () => {
    setSelectedClient(null);
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) {
      deleteClient(client.id);
    }
  };

  // --- Partner Actions ---
  const openAddPartnerModal = () => {
    setSelectedPartner(null);
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsPartnerModalOpen(true);
  };

  const handleClosePartnerModal = () => {
    setIsPartnerModalOpen(false);
    setSelectedPartner(null);
  };

  const handleDeletePartner = (partner: Partner) => {
     // Check if partner is used in any OS before deleting (optional but recommended)
     // const osUsingPartner = osList.filter(os => os.parceiro === partner.name);
     // if (osUsingPartner.length > 0) {
     //    alert(`Não é possível excluir o parceiro "${partner.name}" pois ele está vinculado a ${osUsingPartner.length} Ordem(ns) de Serviço.`);
     //    return;
     // }

    if (window.confirm(`Tem certeza que deseja excluir o parceiro "${partner.name}"? Esta ação não pode ser desfeita.`)) {
      deletePartner(partner.id);
    }
  };

  // Loading state
  if (!isHydrated) {
     return (
       <AuthenticatedLayout>
         {/* Improved Loading Spinner */}
         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
           <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
             <span className="visually-hidden">Carregando Entidades...</span>
           </div>
           <p className="text-muted">Carregando Entidades...</p>
         </div>
       </AuthenticatedLayout>
     );
   }


  return (
    <AuthenticatedLayout>
      {/* Add transition wrapper */}
      <div className="transition-opacity">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <h1 className="h3 mb-0">Entidades</h1>
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
              <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
          </div>

          <div className="row">
            {/* Partners Column (Now Editable) */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4 transition-all">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Users size={18} className="me-2 text-primary" />
                    <h2 className="h5 mb-0 card-title">Parceiros</h2>
                  </div>
                   {/* Add Partner button */}
                   <button className="btn btn-sm btn-primary" onClick={openAddPartnerModal}>
                     <PlusCircle size={16} className="me-1" /> Adicionar Parceiro
                   </button>
                </div>
                <div className="card-body">
                  {partners.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {partners.map((partner) => (
                          <li key={partner.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{partner.name}</span>
                            {/* Partner Action Buttons */}
                            <div className="btn-group btn-group-sm" role="group" aria-label="Ações do Parceiro">
                                <button className="btn btn-outline-secondary" onClick={() => openEditPartnerModal(partner)} title="Editar Parceiro">
                                    <Edit size={14} />
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => handleDeletePartner(partner)} title="Excluir Parceiro">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-center">Nenhum parceiro adicionado ainda.</p>
                    )
                  }
                </div>
                <div className="card-footer text-muted small">
                  Gerencie seus parceiros cadastrados.
                </div>
              </div>
            </div>

            {/* Clients Column (Editable) */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4 transition-all">
                <div className="card-header d-flex justify-content-between align-items-center">
                   <div className="d-flex align-items-center">
                        <Building size={18} className="me-2 text-success" />
                        <h2 className="h5 mb-0 card-title">Clientes</h2>
                   </div>
                   <button className="btn btn-sm btn-success" onClick={openAddClientModal}>
                       <PlusCircle size={16} className="me-1" /> Adicionar Cliente
                   </button>
                </div>
                <div className="card-body">
                  {clients.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {clients.map((client) => (
                          <li key={client.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{client.name}</span>
                             <div className="btn-group btn-group-sm" role="group" aria-label="Ações do Cliente">
                                <button className="btn btn-outline-secondary" onClick={() => openEditClientModal(client)} title="Editar Cliente">
                                    <Edit size={14} />
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => handleDeleteClient(client)} title="Excluir Cliente">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-center">Nenhum cliente adicionado ainda.</p>
                    )
                  }
                </div>
                <div className="card-footer text-muted small">
                  Gerencie seus clientes cadastrados.
                </div>
              </div>
            </div>
          </div>
      </div>


      {/* Client Add/Edit Modal */}
      {isHydrated && (
         <AddEditClientModal
            client={selectedClient}
            isOpen={isClientModalOpen}
            onClose={handleCloseClientModal}
        />
      )}

       {/* Partner Add/Edit Modal */}
       {isHydrated && (
         <AddEditPartnerModal
            partner={selectedPartner}
            isOpen={isPartnerModalOpen}
            onClose={handleClosePartnerModal}
        />
      )}

    </AuthenticatedLayout>
  );
}
