
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
// Ensure Modal type is imported if needed, or use `any` for the instance.
// import type Modal from 'bootstrap/js/dist/modal';

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
  const modalElementRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any | null>(null); // Store Bootstrap modal instance here

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

  // Stable callback for form reset and state cleanup
  const resetFormAndStates = useCallback(() => {
    form.reset();
    setClientInput('');
    setPartnerInput('');
    setShowClientSuggestions(false);
    setShowPartnerSuggestions(false);
    setIsSubmitting(false); // Ensure submitting state is also reset
  }, [form]); // form is stable from useForm

  // Initialize Bootstrap modal and attach/detach event listeners
  useEffect(() => {
    const currentModalElement = modalElementRef.current;
    if (!currentModalElement || typeof window === undefined) return;

    import('bootstrap/js/dist/modal').then(ModalModule => {
        const BootstrapModal = ModalModule.default;
        if (currentModalElement && !modalInstanceRef.current) {
            modalInstanceRef.current = new BootstrapModal(currentModalElement);
            // console.log('Bootstrap modal instance CREATED and stored in ref.');
            currentModalElement.addEventListener('hidden.bs.modal', resetFormAndStates);
        }
    }).catch(error => console.error("Failed to initialize Bootstrap modal:", error));

    return () => {
      if (currentModalElement) {
        currentModalElement.removeEventListener('hidden.bs.modal', resetFormAndStates);
      }
      if (modalInstanceRef.current && typeof modalInstanceRef.current.dispose === 'function') {
        // console.log('Disposing Bootstrap modal instance.');
        try {
            modalInstanceRef.current.dispose();
        } catch (e) {
            console.warn("Error disposing modal instance on cleanup:", e);
        }
        modalInstanceRef.current = null;
      }
    };
  }, [resetFormAndStates]); // Runs once on mount, cleans up on unmount

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

  const handleShowModal = () => {
    if (modalInstanceRef.current && typeof modalInstanceRef.current.show === 'function') {
        modalInstanceRef.current.show();
    } else {
        console.warn('Modal instance not available to show.');
    }
  };

  function onSubmit(values: CreateOSFormValues) { // Removed async as addOS is sync for now
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

      addOS(dataToSubmit); // This is now synchronous for testing
      // console.log(`OS Data prepared (sync): ${dataToSubmit.cliente} - ${dataToSubmit.projeto}`);
      
      if (modalInstanceRef.current && typeof modalInstanceRef.current.hide === 'function') {
        // console.log('Attempting to hide modal programmatically via modalInstanceRef.current.hide().');
        modalInstanceRef.current.hide(); // This should trigger 'hidden.bs.modal' which calls resetFormAndStates
      } else {
        console.warn('onSubmit: modal instance not found or hide is not a function. Modal might not close properly.');
        resetFormAndStates(); // Fallback cleanup if programmatic hide fails
      }
    } catch (error) {
      console.error("Failed to create OS:", error);
      alert('Falha ao criar OS. Por favor, tente novamente.');
      setIsSubmitting(false); // Explicitly reset on error if modal doesn't hide
    }
    // NOTE: setIsSubmitting(false) is now primarily handled by resetFormAndStates,
    // which is called by the 'hidden.bs.modal' event.
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
      {/* Button to trigger the modal programmatically */}
      <button type="button" className="btn btn-primary" onClick={handleShowModal}>
        <PlusCircle className="me-2" size={18} /> Nova OS
      </button>

      {/* Modal HTML structure (removed data-bs-toggle from trigger, id is used by instance) */}
      <div className="modal fade" id="createOSModal" tabIndex={-1} aria-labelledby="createOSModalLabel" aria-hidden="true" ref={modalElementRef}>
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createOSModalLabel">Criar Nova Ordem de Serviço</h5>
              {/* data-bs-dismiss still works fine for internal close buttons */}
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
                             onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)} // Delay to allow click on suggestion
                            autoComplete="off"
                          />
                          {showClientSuggestions && filteredClients.length > 0 && (
                            <div className="list-group position-absolute w-100" style={{ zIndex: 1056, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                              {filteredClients.map(c => (
                                <button type="button" key={c.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                  onClick={() => handleClientSelect(c.name)}>
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
                            onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 200)} // Delay to allow click on suggestion
                            autoComplete="off"
                          />
                          {showPartnerSuggestions && filteredPartners.length > 0 && (
                            <div className="list-group position-absolute w-100" style={{ zIndex: 1056, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                              {filteredPartners.map(p => (
                                <button type="button" key={p.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                  onClick={() => handlePartnerSelect(p.name)}>
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
