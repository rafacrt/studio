
'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, Building, Users, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useOSStore } from '@/store/os-store';
import type { Client } from '@/lib/types';
import AddEditClientModal from '@/components/entities/AddEditClientModal'; // Import the modal

export default function EntitiesPage() {
  const partners = useOSStore((state) => state.partners);
  const clients = useOSStore((state) => state.clients);
  const deleteClient = useOSStore((state) => state.deleteClient);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null); // For delete confirmation

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const openAddModal = () => {
    setSelectedClient(null); // Ensure we are adding, not editing
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null); // Clear selection on close
  };

  const handleDeleteClient = (client: Client) => {
    // Optional: Show a confirmation dialog/modal before deleting
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) {
      deleteClient(client.id);
      setClientToDelete(null); // Clear deletion state
    }
  };


  return (
    <AuthenticatedLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0">Entidades</h1>
        <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
          <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
        </Link>
      </div>

      <div className="row">
        {/* Partners Column (Read-Only) */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Users size={18} className="me-2 text-primary" />
                <h2 className="h5 mb-0 card-title">Parceiros</h2>
              </div>
               {/* Add button might be needed here if partners become manageable */}
               {/* <button className="btn btn-sm btn-outline-primary disabled">
                 <PlusCircle size={16} /> Adicionar
               </button> */}
            </div>
            <div className="card-body">
              {isHydrated ? (
                partners.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {partners.map((partner) => (
                      <li key={partner} className="list-group-item d-flex justify-content-between align-items-center">
                        {partner}
                        {/* <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-secondary disabled"><Edit size={14} /></button>
                          <button className="btn btn-outline-danger disabled"><Trash2 size={14} /></button>
                        </div> */}
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
              Lista de parceiros únicos encontrados nas OS (não editável aqui).
            </div>
          </div>
        </div>

        {/* Clients Column (Editable) */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
               <div className="d-flex align-items-center">
                    <Building size={18} className="me-2 text-success" />
                    <h2 className="h5 mb-0 card-title">Clientes</h2>
               </div>
               <button className="btn btn-sm btn-success" onClick={openAddModal}>
                   <PlusCircle size={16} className="me-1" /> Adicionar Cliente
               </button>
            </div>
            <div className="card-body">
              {isHydrated ? (
                clients.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {clients.map((client) => (
                      <li key={client.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{client.name}</span>
                         <div className="btn-group btn-group-sm" role="group" aria-label="Ações do Cliente">
                            <button className="btn btn-outline-secondary" onClick={() => openEditModal(client)} title="Editar Cliente">
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
              ) : (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Carregando clientes...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer text-muted small">
              Gerencie seus clientes cadastrados.
            </div>
          </div>
        </div>
      </div>

      {/* Client Add/Edit Modal */}
      {isHydrated && (
         <AddEditClientModal
            client={selectedClient}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
        />
      )}

    </AuthenticatedLayout>
  );
}
