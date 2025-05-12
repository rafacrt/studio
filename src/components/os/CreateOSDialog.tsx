
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react'; // Keep lucide icons

// Removed useToast import
import { useOSStore } from '@/store/os-store';
import { OSStatus, ALL_OS_STATUSES, type CreateOSData } from '@/lib/types';

// Use Bootstrap's form validation approach alongside react-hook-form
const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Nome do cliente é obrigatório.' }),
  parceiro: z.string().optional(),
  projeto: z.string().min(1, { message: 'Nome do projeto é obrigatório.' }),
  tarefa: z.string().min(1, { message: 'A descrição da tarefa é obrigatória.' }),
  observacoes: z.string().optional(),
  tempoTrabalhado: z.string().optional(),
  programadoPara: z.string().optional(), // Added: Accept string date (YYYY-MM-DD)
  status: z.nativeEnum(OSStatus).default(OSStatus.NA_FILA),
  isUrgent: z.boolean().default(false),
});

type CreateOSFormValues = z.infer<typeof formSchema>;

export function CreateOSDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed toast related code
  const { addOS, partners, addPartner } = useOSStore((state) => ({
      addOS: state.addOS,
      partners: state.partners,
      addPartner: state.addPartner,
  }));
  const modalRef = useRef<HTMLDivElement>(null);
  const [bootstrapModal, setBootstrapModal] = useState<any>(null); // Store Bootstrap modal instance
  const [partnerInput, setPartnerInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const partnerInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Initialize Bootstrap modal instance when the component mounts
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined' && modalRef.current) {
      // Dynamically import Bootstrap modal to ensure it runs client-side
      import('bootstrap/js/dist/modal').then((ModalModule) => {
          const Modal = ModalModule.default;
          // Check ref again inside the promise resolution
          if (modalRef.current && !bootstrapModal) {
             setBootstrapModal(new Modal(modalRef.current));
          }
      }).catch(err => console.error("Failed to load Bootstrap modal:", err));
    }

    // Cleanup function to destroy modal instance
    return () => {
      // Check if modal instance exists and has dispose method
      if (bootstrapModal && typeof bootstrapModal.dispose === 'function') {
        try {
            bootstrapModal.dispose();
        } catch (error) {
            console.warn("Error disposing Bootstrap modal:", error);
        }
      }
    };
    // Dependency array includes bootstrapModal to re-run if it changes, though it should only init once.
  }, [bootstrapModal]);


  const form = useForm<CreateOSFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      parceiro: '',
      projeto: '',
      tarefa: '',
      observacoes: '',
      tempoTrabalhado: '',
      programadoPara: '', // Default to empty string
      status: OSStatus.NA_FILA,
      isUrgent: false,
    },
    mode: 'onChange', // Validate on change for Bootstrap styles
  });

  // Update partnerInput state when form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'parceiro') {
        const currentPartnerValue = value.parceiro ?? '';
        setPartnerInput(currentPartnerValue);
        // Show suggestions only if input is not empty and there are filtered partners
        const currentFilteredPartners = partners.filter(p =>
          p.toLowerCase().includes(currentPartnerValue.toLowerCase())
        );
        setShowSuggestions(!!currentPartnerValue && currentFilteredPartners.length > 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, partners]); // Added partners dependency


  const filteredPartners = partnerInput
    ? partners.filter(p => p.toLowerCase().includes(partnerInput.toLowerCase()))
    : [];

  const handlePartnerSelect = (partnerName: string) => {
    form.setValue('parceiro', partnerName, { shouldValidate: true });
    setPartnerInput(partnerName);
    setShowSuggestions(false);
  };

  async function onSubmit(values: CreateOSFormValues) {
    setIsSubmitting(true);
    try {
      const dataToSubmit: CreateOSData = {
        ...values,
        parceiro: values.parceiro || undefined,
        observacoes: values.observacoes || '',
        tempoTrabalhado: values.tempoTrabalhado || '',
        programadoPara: values.programadoPara || undefined, // Ensure undefined if empty
      };

      // Add partner to the list if it's new and not empty
      if (values.parceiro && !partners.includes(values.parceiro)) {
          addPartner(values.parceiro);
      }

      addOS(dataToSubmit);

      // Removed success toast
      console.log(`OS Criada: ${values.cliente} - ${values.projeto}`);
      form.reset();
      setPartnerInput(''); // Reset partner input state
       if (bootstrapModal && typeof bootstrapModal.hide === 'function') {
            bootstrapModal.hide(); // Use Bootstrap API to hide modal
       }
    } catch (error) {
      console.error("Failed to create OS:", error);
      // Removed error toast
      alert('Falha ao criar OS. Por favor, tente novamente.'); // Basic alert fallback
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleModalClose = () => {
      form.reset(); // Reset form on cancel/close
      setPartnerInput('');
      setShowSuggestions(false);
      // No need to manually set isOpen to false, Bootstrap handles it
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    // Check if document is defined (client-side)
     if (typeof document !== 'undefined') {
        document.addEventListener('mousedown', handleClickOutside);
     }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, []);

  return (
    <>
      {/* Button to trigger the modal */}
      <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createOSModal">
        <PlusCircle className="me-2" size={18} /> Nova OS
      </button>

      {/* Bootstrap Modal */}
      <div className="modal fade" id="createOSModal" tabIndex={-1} aria-labelledby="createOSModalLabel" aria-hidden="true" ref={modalRef}>
        {/* Add modal-dialog-scrollable and potentially size class like modal-lg */}
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createOSModalLabel">Criar Nova Ordem de Serviço</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleModalClose}></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-4">Preencha os detalhes abaixo para criar uma nova OS. Clique em salvar quando terminar.</p>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                 <div className="row"> {/* Using Bootstrap grid for layout */}
                    <div className="col-md-6">
                        {/* Cliente */}
                        <div className="mb-3">
                          <label htmlFor="cliente" className="form-label">Nome do Cliente *</label>
                          <input
                            type="text"
                            id="cliente"
                            placeholder="Ex: Empresa Acme"
                            className={`form-control ${form.formState.errors.cliente ? 'is-invalid' : ''}`}
                            {...form.register('cliente')}
                          />
                          {form.formState.errors.cliente && (
                            <div className="invalid-feedback">{form.formState.errors.cliente.message}</div>
                          )}
                        </div>
                    </div>
                    <div className="col-md-6">
                         {/* Parceiro with suggestions */}
                        <div className="mb-3 position-relative" ref={partnerInputRef}>
                          <label htmlFor="parceiro" className="form-label">Parceiro (opcional)</label>
                          <input
                            type="text"
                            id="parceiro"
                            placeholder="Ex: Agência XYZ"
                            className={`form-control ${form.formState.errors.parceiro ? 'is-invalid' : ''}`}
                            {...form.register('parceiro')}
                            value={partnerInput} // Bind directly to state for suggestions
                            onChange={(e) => {
                                const newValue = e.target.value;
                                form.setValue('parceiro', newValue, { shouldValidate: true }); // Update form state
                                setPartnerInput(newValue);
                                // Update suggestion visibility based on new value and filtered partners
                                const currentFilteredPartners = partners.filter(p =>
                                    p.toLowerCase().includes(newValue.toLowerCase())
                                );
                                setShowSuggestions(!!newValue && currentFilteredPartners.length > 0);
                            }}
                            onFocus={() => setShowSuggestions(!!partnerInput && filteredPartners.length > 0)}
                            autoComplete="off"
                          />
                          {showSuggestions && filteredPartners.length > 0 && (
                            <div className="list-group position-absolute w-100" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                              {filteredPartners.map(p => (
                                <button
                                  type="button"
                                  key={p}
                                  className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                                  onClick={() => handlePartnerSelect(p)}
                                >
                                  {p}
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


                {/* Projeto */}
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

                {/* Tarefa */}
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

                {/* Observacoes */}
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

                {/* Tempo Trabalhado */}
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
                         {/* Status */}
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
                        {/* Programado Para */}
                        <div className="mb-3">
                            <label htmlFor="programadoPara" className="form-label">Programado Para (opcional)</label>
                            <input
                                type="date" // Use HTML5 date input
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


                 {/* Urgente */}
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
                     <p className="text-muted small mt-1 mb-0"> {/* Added mb-0 */}
                        Tarefas urgentes serão destacadas e priorizadas na visualização.
                     </p>
                </div>

                 {/* Submit Buttons - Moved inside form */}
                <div className="modal-footer mt-4 pt-3 border-top"> {/* Added border-top */}
                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" onClick={handleModalClose} disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!form.formState.isValid || isSubmitting}> {/* Disable if form invalid */}
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
