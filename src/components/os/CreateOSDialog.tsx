
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';

import { useOSStore } from '@/store/os-store';
import type { Partner } from '@/store/os-store';
import type { Client } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES, type CreateOSData } from '@/lib/types';
import type Modal from 'bootstrap/js/dist/modal';

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Nome do cliente é obrigatório.' }),
  parceiro: z.string().optional(),
  projeto: z.string().min(1, { message: 'Nome do projeto é obrigatório.' }),
  tarefa: z.string().min(1, { message: 'A descrição da tarefa é obrigatória.' }),
  observacoes: z.string().optional(),
  tempoTrabalhado: z.string().optional(),
  programadoPara: z.string().optional(),
  status: z.nativeEnum(OSStatus).default(OSStatus.NA_FILA),
  isUrgent: z.boolean().default(false),
});

type CreateOSFormValues = z.infer<typeof formSchema>;

export function CreateOSDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOS, partners, clients } = useOSStore((state) => ({
      addOS: state.addOS,
      partners: state.partners,
      clients: state.clients,
  }));
  const modalRef = useRef<HTMLDivElement>(null);
  const [bootstrapModal, setBootstrapModal] = useState<Modal | null>(null);

  const [clientInput, setClientInput] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientInputRef = useRef<HTMLInputElement>(null);

  const [partnerInput, setPartnerInput] = useState('');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const partnerInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateOSFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      parceiro: '',
      projeto: '',
      tarefa: '',
      observacoes: '',
      tempoTrabalhado: '',
      programadoPara: '',
      status: OSStatus.NA_FILA,
      isUrgent: false,
    },
    mode: 'onChange',
  });

  // Memoized version of handleModalClose for useEffect dependency
  const handleModalClose = useCallback(() => {
    console.log('handleModalClose called: Resetting form and inputs.');
    form.reset();
    setClientInput('');
    setPartnerInput('');
    setShowClientSuggestions(false);
    setShowPartnerSuggestions(false);
  }, [form]); // form.reset is stable

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    // Listener for when Bootstrap itself has finished hiding the modal
    modalElement.addEventListener('hidden.bs.modal', handleModalClose);

    // Initialize Bootstrap modal instance
    if (typeof window !== 'undefined') {
        import('bootstrap/js/dist/modal').then(ModalModule => {
            const BootstrapModal = ModalModule.default;
            if (modalElement) { // Check modalElement again, as import is async
                // Get existing instance or create a new one.
                const instance = BootstrapModal.getInstance(modalElement) || new BootstrapModal(modalElement);
                setBootstrapModal(instance);
            }
        }).catch(error => console.error("Failed to initialize Bootstrap modal:", error));
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('hidden.bs.modal', handleModalClose);
      }
      // Note: Disposing the modal instance here can be tricky if Bootstrap
      // also manages it via data attributes. If we `new` an instance, we should `dispose` it.
      // For modals toggled by data attributes, explicit disposal might not always be needed
      // or could even conflict if not handled carefully.
      // The current approach uses getInstance OR new, so disposal is generally safe.
      if (bootstrapModal && typeof bootstrapModal.dispose === 'function') {
        try {
             // Check if the modal is still associated with the DOM element
            if (bootstrapModal._element === modalElement) {
                // bootstrapModal.dispose(); // Consider if this is truly needed or causes issues
            }
        } catch (e) {
            console.warn("Error during modal dispose on cleanup:", e);
        }
      }
      setBootstrapModal(null); // Clear our reference
    };
  }, [handleModalClose, bootstrapModal]); // bootstrapModal added to re-evaluate if it changes, though it shouldn't externally


  const filteredClients = useMemo(() => {
    if (!clientInput) return [];
    const lowerInput = clientInput.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(lowerInput));
  }, [clientInput, clients]);

  const filteredPartners = useMemo(() => {
    if (!partnerInput) return [];
    const lowerInput = partnerInput.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(lowerInput));
  }, [partnerInput, partners]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setClientInput(value.cliente ?? '');
      setPartnerInput(value.parceiro ?? '');
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);


  const handleClientSelect = (clientName: string) => {
    form.setValue('cliente', clientName, { shouldValidate: true });
    setClientInput(clientName);
    setShowClientSuggestions(false);
    clientInputRef.current?.focus();
  };

  const handlePartnerSelect = (partnerName: string) => {
    form.setValue('parceiro', partnerName, { shouldValidate: true });
    setPartnerInput(partnerName);
    setShowPartnerSuggestions(false);
    partnerInputRef.current?.focus();
  };

  async function onSubmit(values: CreateOSFormValues) {
    setIsSubmitting(true);
    try {
      const dataToSubmit: CreateOSData = {
        ...values,
        cliente: clientInput.trim(),
        parceiro: partnerInput.trim() || undefined,
        observacoes: values.observacoes || '',
        tempoTrabalhado: values.tempoTrabalhado || '',
        programadoPara: values.programadoPara || undefined,
      };

      await addOS(dataToSubmit); // This is a placeholder in the store

      console.log(`OS Criada: ${dataToSubmit.cliente} - ${dataToSubmit.projeto}`);
      
      // Programmatically hide the modal.
      // The 'hidden.bs.modal' event listener (setup in useEffect)
      // will then call handleModalClose to reset the form.
      if (bootstrapModal && typeof bootstrapModal.hide === 'function') {
        console.log('Attempting to hide modal programmatically.');
        bootstrapModal.hide();
      } else {
        console.warn('onSubmit: bootstrapModal instance not found or hide is not a function. Modal might not close.');
        // If hide fails for some reason, manually trigger cleanup as a fallback.
        // This won't hide the modal but will reset the form.
        handleModalClose();
      }
    } catch (error) {
      console.error("Failed to create OS:", error);
      alert('Falha ao criar OS. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

   const setupClickListener = (ref: React.RefObject<HTMLInputElement>, setShowSuggestionsFn: React.Dispatch<React.SetStateAction<boolean>>) => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.parentElement?.contains(event.target as Node)) {
          setShowSuggestionsFn(false);
        }
      };
       if (typeof document !== 'undefined') {
          document.addEventListener('mousedown', handleClickOutside);
       }
      return () => {
        if (typeof document !== 'undefined') {
          document.removeEventListener('mousedown', handleClickOutside);
        }
      };
  };
  useEffect(() => setupClickListener(clientInputRef, setShowClientSuggestions), [clientInputRef, setShowClientSuggestions]);
  useEffect(() => setupClickListener(partnerInputRef, setShowPartnerSuggestions), [partnerInputRef, setShowPartnerSuggestions]);


  return (
    <>
      <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createOSModal">
        <PlusCircle className="me-2" size={18} /> Nova OS
      </button>

      <div className="modal fade" id="createOSModal" tabIndex={-1} aria-labelledby="createOSModalLabel" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createOSModalLabel">Criar Nova Ordem de Serviço</h5>
              {/* Removed onClick from btn-close, data-bs-dismiss will trigger hidden.bs.modal */}
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-4">Preencha os detalhes abaixo para criar uma nova OS. Clique em salvar quando terminar.</p>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                 <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3 position-relative">
                          <label htmlFor="cliente" className="form-label">Nome do Cliente *</label>
                          <input
                            ref={clientInputRef}
                            type="text"
                            id="cliente"
                            placeholder="Ex: Empresa Acme"
                            className={`form-control ${form.formState.errors.cliente ? 'is-invalid' : ''}`}
                            {...form.register('cliente')}
                            value={clientInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setClientInput(val);
                                form.setValue('cliente', val, { shouldValidate: true });
                                setShowClientSuggestions(!!val && clients.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).length > 0);
                            }}
                            onFocus={() => setShowClientSuggestions(!!clientInput && filteredClients.length > 0)}
                             onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                            autoComplete="off"
                          />
                          {showClientSuggestions && filteredClients.length > 0 && (
                            <div className="list-group position-absolute w-100" style={{ zIndex: 1056, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                              {filteredClients.map(c => (
                                <button type="button" key={c.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                                  onMouseDown={(e) => e.preventDefault()} onClick={() => handleClientSelect(c.name)}>
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          )}
                          {form.formState.errors.cliente && (
                            <div className="invalid-feedback">{form.formState.errors.cliente.message}</div>
                          )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3 position-relative">
                          <label htmlFor="parceiro" className="form-label">Parceiro (opcional)</label>
                          <input
                            ref={partnerInputRef}
                            type="text"
                            id="parceiro"
                            placeholder="Ex: Agência XYZ"
                            className={`form-control ${form.formState.errors.parceiro ? 'is-invalid' : ''}`}
                            {...form.register('parceiro')}
                            value={partnerInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setPartnerInput(val);
                                form.setValue('parceiro', val, { shouldValidate: true });
                                setShowPartnerSuggestions(!!val && partners.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).length > 0);
                            }}
                            onFocus={() => setShowPartnerSuggestions(!!partnerInput && filteredPartners.length > 0)}
                            onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 200)}
                            autoComplete="off"
                          />
                          {showPartnerSuggestions && filteredPartners.length > 0 && (
                            <div className="list-group position-absolute w-100" style={{ zIndex: 1056, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                              {filteredPartners.map(p => (
                                <button type="button" key={p.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                                  onMouseDown={(e) => e.preventDefault()} onClick={() => handlePartnerSelect(p.name)}>
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          )}
                          {form.formState.errors.parceiro && (
                            <div className="invalid-feedback">{form.formState.errors.parceiro.message}</div>
                          )}
                        </div>
                    </div>
                 </div>

                <div className="mb-3">
                  <label htmlFor="projeto" className="form-label">Nome do Projeto *</label>
                  <input
                    type="text"
                    id="projeto"
                    placeholder="Ex: Desenvolvimento de Website"
                    className={`form-control ${form.formState.errors.projeto ? 'is-invalid' : ''}`}
                    {...form.register('projeto')}
                  />
                  {form.formState.errors.projeto && (
                    <div className="invalid-feedback">{form.formState.errors.projeto.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="tarefa" className="form-label">Tarefa Principal *</label>
                  <textarea
                    id="tarefa"
                    placeholder="Descreva a tarefa principal a ser realizada..."
                    className={`form-control ${form.formState.errors.tarefa ? 'is-invalid' : ''}`}
                    rows={3}
                    {...form.register('tarefa')}
                  />
                  {form.formState.errors.tarefa && (
                    <div className="invalid-feedback">{form.formState.errors.tarefa.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="observacoes" className="form-label">Observações</label>
                  <textarea
                    id="observacoes"
                    placeholder="Notas adicionais, detalhes importantes..."
                    className={`form-control ${form.formState.errors.observacoes ? 'is-invalid' : ''}`}
                    rows={3}
                    {...form.register('observacoes')}
                  />
                   {form.formState.errors.observacoes && (
                    <div className="invalid-feedback">{form.formState.errors.observacoes.message}</div>
                  )}
                </div>

                 <div className="mb-3">
                  <label htmlFor="tempoTrabalhado" className="form-label">Tempo Trabalhado (inicial)</label>
                  <input
                    type="text"
                    id="tempoTrabalhado"
                    placeholder="Ex: 2h reunião, 4h desenvolvimento"
                    className={`form-control ${form.formState.errors.tempoTrabalhado ? 'is-invalid' : ''}`}
                    {...form.register('tempoTrabalhado')}
                  />
                   <div className="form-text">
                      Registre o tempo já dedicado ou sessões de trabalho.
                    </div>
                  {form.formState.errors.tempoTrabalhado && (
                    <div className="invalid-feedback">{form.formState.errors.tempoTrabalhado.message}</div>
                  )}
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="status" className="form-label">Status</label>
                          <select
                            id="status"
                            className={`form-select ${form.formState.errors.status ? 'is-invalid' : ''}`}
                            defaultValue={OSStatus.NA_FILA}
                            {...form.register('status')}
                          >
                            {ALL_OS_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {form.formState.errors.status && (
                            <div className="invalid-feedback">{form.formState.errors.status.message}</div>
                          )}
                        </div>
                    </div>
                     <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="programadoPara" className="form-label">Programado Para (opcional)</label>
                            <input
                                type="date"
                                id="programadoPara"
                                className={`form-control ${form.formState.errors.programadoPara ? 'is-invalid' : ''}`}
                                {...form.register('programadoPara')}
                            />
                            {form.formState.errors.programadoPara && (
                                <div className="invalid-feedback">{form.formState.errors.programadoPara.message}</div>
                            )}
                             <div className="form-text">
                                Data prevista para conclusão ou próxima etapa.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-3 form-check border p-3 rounded shadow-sm">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="isUrgent"
                        {...form.register('isUrgent')}
                    />
                    <label className="form-check-label" htmlFor="isUrgent">
                        Marcar como Urgente
                    </label>
                     <p className="text-muted small mt-1 mb-0">
                        Tarefas urgentes serão destacadas e priorizadas na visualização.
                     </p>
                </div>

                <div className="modal-footer mt-4 pt-3 border-top">
                    {/* Removed onClick from Cancel button, data-bs-dismiss will trigger hidden.bs.modal */}
                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!form.formState.isValid || isSubmitting || !clientInput.trim()}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Salvando...
                            </>
                        ) : 'Salvar OS'}
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

