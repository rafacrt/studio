
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Client } from '@/lib/types';
import { useOSStore } from '@/store/os-store';

const clientSchema = z.object({
  name: z.string().min(1, { message: 'Nome do cliente é obrigatório.' }),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface AddEditClientModalProps {
  client?: Client | null; // Client to edit, or null/undefined to add
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEditClientModal({ client, isOpen, onClose }: AddEditClientModalProps) {
  const addClient = useOSStore((state) => state.addClient);
  const updateClient = useOSStore((state) => state.updateClient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [bootstrapModal, setBootstrapModal] = useState<any>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  // Reset form when client prop changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({ name: client?.name || '' });
    } else {
      form.reset({ name: '' }); // Clear form on close
    }
  }, [client, isOpen, form.reset]); // form.reset added

  // Initialize and manage Bootstrap modal instance
  useEffect(() => {
    if (typeof window !== 'undefined' && modalRef.current) {
      import('bootstrap/js/dist/modal').then((ModalModule) => {
        const Modal = ModalModule.default;
        if (modalRef.current) {
          const modalInstance = new Modal(modalRef.current);
          setBootstrapModal(modalInstance);

          // Handle external close events (like backdrop click or ESC key)
          const handleHide = () => {
             if (isOpen) { // Only call onClose if the modal was supposed to be open
                onClose();
             }
          };
          modalRef.current.addEventListener('hidden.bs.modal', handleHide);

          // Cleanup listener on unmount
          return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener('hidden.bs.modal', handleHide);
            }
            // Attempt to dispose only if instance exists and hasn't been disposed
             if (modalInstance && (modalInstance as any)._isShown) {
                try {
                    modalInstance.dispose();
                } catch (e) {
                     console.warn("Error disposing Bootstrap modal:", e);
                }
             }
          };
        }
      }).catch(err => console.error("Failed to load Bootstrap modal:", err));
    }
     // Ensure modal is disposed if component unmounts while modal is initializing or open
     return () => {
       if (bootstrapModal && typeof bootstrapModal.dispose === 'function') {
            try {
                 // Check if it's shown before disposing to avoid errors if already hidden/disposed
                if ((bootstrapModal as any)._isShown) {
                     bootstrapModal.hide(); // Hide first to trigger events if needed
                }
                 bootstrapModal.dispose();
            } catch (error) {
                console.warn("Error disposing Bootstrap modal on cleanup:", error);
            }
        }
     };
  }, []); // Run only once on mount

  // Show/hide modal based on isOpen prop
  useEffect(() => {
    if (bootstrapModal) {
      if (isOpen) {
        if (!(bootstrapModal as any)._isShown) { // Avoid showing if already shown
             bootstrapModal.show();
        }
      } else {
         if ((bootstrapModal as any)._isShown) { // Avoid hiding if already hidden
             bootstrapModal.hide();
         }
      }
    }
  }, [isOpen, bootstrapModal]);

  const onSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      if (client) {
        // Update existing client
        updateClient({ ...client, name: values.name });
        console.log(`Cliente "${values.name}" atualizado.`);
      } else {
        // Add new client
        const newClient = addClient({ name: values.name });
        console.log(`Cliente "${newClient.name}" adicionado.`);
      }
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Failed to save client:', error);
      alert('Falha ao salvar cliente. Por favor, tente novamente.'); // Basic feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActualClose = () => {
     form.reset({ name: '' }); // Explicitly reset form state
     onClose(); // Call the passed onClose handler
  };


  return (
    <div
      className="modal fade"
      id="clientModal"
      tabIndex={-1}
      aria-labelledby="clientModalLabel"
      aria-hidden={!isOpen} // Controlled by isOpen state
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="modal-header">
              <h5 className="modal-title" id="clientModalLabel">
                {client ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
              </h5>
              {/* Use the onClose passed from the parent */}
              <button type="button" className="btn-close" aria-label="Close" onClick={handleActualClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="clientName" className="form-label">Nome do Cliente *</label>
                <input
                  type="text"
                  id="clientName"
                  className={`form-control ${form.formState.errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ex: Empresa Fantástica S.A."
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <div className="invalid-feedback">{form.formState.errors.name.message}</div>
                )}
              </div>
              {/* Add more client fields here if needed in the future */}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={handleActualClose} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={!form.formState.isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvando...
                  </>
                ) : (client ? 'Salvar Alterações' : 'Adicionar Cliente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
