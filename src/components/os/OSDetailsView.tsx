'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { OS } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User as UserIcon, Users, Briefcase, MessageSquare, Clock3, Save, Edit, Calendar as CalendarIcon, Printer, CheckSquare } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import type { Partner } from '@/store/os-store'; 
import type { Client } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';

const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.NA_FILA: return <Clock size={16} className="me-2" />;
    case OSStatus.AGUARDANDO_CLIENTE: return <UserIcon size={16} className="me-2" />;
    case OSStatus.EM_PRODUCAO: return <Server size={16} className="me-2" />;
    case OSStatus.AGUARDANDO_PARCEIRO: return <Users size={16} className="me-2" />;
    case OSStatus.FINALIZADO: return <CheckCircle2 size={16} className="me-2" />;
    default: return <FileText size={16} className="me-2" />;
  }
};

interface OSDetailsViewProps {
  os: OS;
}

export default function OSDetailsView({ os: initialOs }: OSDetailsViewProps) {
  const updateOS = useOSStore((state) => state.updateOS);
  const updateOSStatus = useOSStore((state) => state.updateOSStatus);
  const partners = useOSStore((state) => state.partners);
  const clients = useOSStore((state) => state.clients);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize formData ensuring programadoPara is in 'yyyy-MM-dd' or empty string
  const initialProgramadoPara = initialOs.programadoPara ? initialOs.programadoPara.split('T')[0] : '';
  const [formData, setFormData] = useState<OS>({ ...initialOs, programadoPara: initialProgramadoPara });

  // Local states for controlling client/partner input fields and their suggestion lists
  const [clientInput, setClientInput] = useState(initialOs.cliente || '');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientInputRef = useRef<HTMLInputElement>(null);

  const [partnerInput, setPartnerInput] = useState(initialOs.parceiro || '');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const partnerInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // This effect synchronizes formData with initialOs when:
    // 1. The `initialOs.id` changes (viewing a completely different OS).
    // 2. We are *not* in editing mode (`!isEditing`), to reflect external updates or reset after canceling edit.
    // It should *not* reset user's typed data if `isEditing` is true and `initialOs.id` is the same.
    
    const currentProgramadoPara = initialOs.programadoPara ? initialOs.programadoPara.split('T')[0] : '';

    if (initialOs.id !== formData.id) { // Case 1: Switched to a new OS
      setFormData({ ...initialOs, programadoPara: currentProgramadoPara });
      setClientInput(initialOs.cliente || '');
      setPartnerInput(initialOs.parceiro || '');
      setShowClientSuggestions(false);
      setShowPartnerSuggestions(false);
    } else if (!isEditing) { // Case 2: Not editing (viewing current OS or just exited edit mode)
      // Refresh formData from initialOs to reflect any updates or to reset after cancel.
      setFormData({ ...initialOs, programadoPara: currentProgramadoPara });
      setClientInput(initialOs.cliente || '');
      setPartnerInput(initialOs.parceiro || '');
      setShowClientSuggestions(false);
      setShowPartnerSuggestions(false);
    }
    // If isEditing is true AND initialOs.id === formData.id, this effect does nothing,
    // allowing local formData changes (typing) to persist.
  }, [initialOs, isEditing, formData.id]);


  const filteredClients = useMemo(() => {
    if (!clientInput) return []; // Use clientInput for filtering suggestions
    const lowerInput = clientInput.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(lowerInput));
  }, [clientInput, clients]);

  const filteredPartners = useMemo(() => {
    if (!partnerInput) return []; // Use partnerInput for filtering suggestions
    const lowerInput = partnerInput.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(lowerInput));
  }, [partnerInput, partners]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'cliente') {
      setClientInput(value); // Update local state for suggestion box logic
      setFormData(prev => ({ ...prev, cliente: value })); // Update main form data
      setShowClientSuggestions(!!value && clients.filter(c => c.name.toLowerCase().includes(value.toLowerCase())).length > 0 && document.activeElement === clientInputRef.current);
    } else if (name === 'parceiro') {
      setPartnerInput(value); // Update local state for suggestion box logic
      setFormData(prev => ({ ...prev, parceiro: value || undefined })); // Update main form data
      setShowPartnerSuggestions(!!value && partners.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).length > 0 && document.activeElement === partnerInputRef.current);
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'programadoPara') { // Ensure date is handled correctly
       setFormData(prev => ({
        ...prev,
        [name]: value || undefined // Store as 'yyyy-MM-dd' or undefined
      }));
    }
     else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClientSelect = (clientName: string) => {
    setFormData(prev => ({ ...prev, cliente: clientName }));
    setClientInput(clientName); // Also update clientInput for consistency if needed
    setShowClientSuggestions(false);
    clientInputRef.current?.focus();
  };

  const handlePartnerSelect = (partnerName: string) => {
    setFormData(prev => ({ ...prev, parceiro: partnerName }));
    setPartnerInput(partnerName); // Also update partnerInput
    setShowPartnerSuggestions(false);
    partnerInputRef.current?.focus();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // When saving, ensure formData contains the definitive values from clientInput/partnerInput
      // if they were being actively typed into. Otherwise, formData's own values are fine.
      // The current handleInputChange already updates formData correctly for client/partner.
      const dataToSave: OS = {
        ...formData,
        cliente: formData.cliente.trim(), 
        parceiro: formData.parceiro?.trim() || undefined,
        programadoPara: formData.programadoPara || undefined, // Ensure it's undefined if empty
      };
      updateOS(dataToSave);
      console.log(`OS Atualizada: ${dataToSave.numero}`);
      setIsEditing(false); 
    } catch (error) {
      console.error("Failed to update OS:", error);
      alert('Falha ao atualizar OS. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // This will trigger the useEffect to reset formData from initialOs
  };

  const handleFinalizeOS = () => {
    if (formData.status !== OSStatus.FINALIZADO) {
        updateOSStatus(formData.id, OSStatus.FINALIZADO);
        // formData will be updated via the store update and useEffect
        console.log(`OS ${formData.numero} finalizada.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const setupClickListener = (ref: React.RefObject<HTMLInputElement>, setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>) => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.parentElement?.contains(event.target as Node)) {
          setShowSuggestions(false);
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
  useEffect(() => setupClickListener(clientInputRef, setShowClientSuggestions), [clientInputRef]);
  useEffect(() => setupClickListener(partnerInputRef, setShowPartnerSuggestions), [partnerInputRef]);


  const DetailItem = ({ label, value, icon, name, isEditableField, children, className }: {
    label: string;
    value?: string | null | boolean;
    icon?: React.ReactNode;
    name?: keyof OS;
    isEditableField: boolean;
    children?: React.ReactNode;
    className?: string;
  }) => {
    let displayValue: string | React.ReactNode = value;
    if ((name === 'programadoPara' || name === 'dataAbertura' || name === 'dataFinalizacao') && typeof value === 'string' && value) {
      try {
        // Dates are stored as 'yyyy-MM-dd' or full ISO. Parse ISO if it contains 'T'.
        const dateStr = value.includes('T') ? value : `${value}T00:00:00Z`; // Ensure ISO for parseISO
        const date = parseISO(dateStr);
        if (isValid(date)) {
          const formatString = (name === 'programadoPara' && value.length === 10) ? "dd/MM/yyyy" : "dd/MM/yyyy 'às' HH:mm";
          displayValue = format(date, formatString, { locale: ptBR });
        } else {
          displayValue = value; // Show original if not valid ISO string
        }
      } catch {
        displayValue = value; // Show original on parsing error
      }
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Sim' : 'Não';
    }

    return (
      <div className={`row py-2 ${className || ''}`}>
        <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium">{icon}{label}</dt>
        <dd className="col-sm-9 mb-0">
          {isEditing && isEditableField ? (
            children
          ) : (
            <span className={`text-break form-control-plaintext p-0`}>
                {displayValue || <span className="text-muted fst-italic">N/A</span>}
            </span>
          )}
        </dd>
      </div>
    );
  };

  return (
    <div className={`container-fluid os-details-print-container ${formData.isUrgent && !isEditing ? 'os-details-urgent' : ''}`}>
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2 no-print">
        <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
          <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
        </Link>
        <div className="d-flex gap-2 flex-wrap">
          {isEditing ? (
            <>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </button>
              <button className="btn btn-success btn-sm" onClick={handleSave} disabled={isSaving || !formData.cliente?.trim() || !formData.projeto?.trim() || !formData.tarefa?.trim()}>
                {isSaving ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> : <Save size={16} className="me-1" />}
                Salvar Alterações
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              <Edit size={16} className="me-1" />
              Editar OS
            </button>
          )}
           {!isEditing && formData.status !== OSStatus.FINALIZADO && (
             <button className="btn btn-info btn-sm" onClick={handleFinalizeOS} disabled={isSaving}>
               <CheckSquare size={16} className="me-1" /> Finalizar OS
             </button>
           )}
          <button className="btn btn-outline-dark btn-sm" onClick={handlePrint}>
            <Printer size={16} className="me-1" /> Imprimir OS
          </button>
        </div>
      </div>

      <div className={`card shadow-lg mb-4`}>
        <div className={`card-header p-3 border-bottom d-flex justify-content-between align-items-start ${formData.isUrgent && !isEditing ? '' : 'bg-light'}`}>
          <div>
            {isEditing ? (
              <input
                type="text"
                className="form-control form-control-lg mb-1 fw-bold"
                name="projeto"
                value={formData.projeto}
                onChange={handleInputChange}
                placeholder="Nome do Projeto"
                style={{ fontSize: '1.25rem' }}
                required
                disabled={!isEditing}
              />
            ) : (
              <h1 className="card-title h4 mb-1 fw-bold">{formData.projeto}</h1>
            )}
            <p className="card-subtitle text-muted mb-0">
              Ordem de Serviço: {initialOs.numero}
            </p>
          </div>
          {formData.isUrgent && !isEditing && (
            <span className="badge bg-danger text-white fs-6 px-3 py-1 d-flex align-items-center shadow-sm">
              <Flag size={16} className="me-1" /> URGENTE
            </span>
          )}
        </div>
        <div className="card-body p-4">
          <dl className="mb-0">
            <DetailItem label="Cliente" icon={<UserIcon size={16} className="me-2 text-primary" />} name="cliente" isEditableField={true} value={formData.cliente}>
              <div className="position-relative">
                <input
                  ref={clientInputRef}
                  type="text"
                  className="form-control form-control-sm"
                  name="cliente"
                  value={formData.cliente || ''} // Bind value to formData.cliente
                  onChange={handleInputChange}
                  onFocus={() => setShowClientSuggestions(!!formData.cliente && filteredClients.length > 0)}
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)} 
                  autoComplete="off"
                  placeholder="Digite ou selecione um cliente"
                  disabled={!isEditing}
                  required
                />
                {isEditing && showClientSuggestions && filteredClients.length > 0 && (
                  <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                    {filteredClients.map(c => (
                      <button type="button" key={c.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                        onMouseDown={(e) => e.preventDefault()} onClick={() => handleClientSelect(c.name)}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DetailItem>

            <DetailItem label="Parceiro" icon={<Users size={16} className="me-2 text-primary" />} name="parceiro" isEditableField={true} value={formData.parceiro}>
              <div className="position-relative">
                <input
                  ref={partnerInputRef}
                  type="text"
                  className="form-control form-control-sm"
                  name="parceiro"
                  value={formData.parceiro || ''} // Bind value to formData.parceiro
                  onChange={handleInputChange}
                  onFocus={() => setShowPartnerSuggestions(!!formData.parceiro && filteredPartners.length > 0)}
                  onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 200)} 
                  autoComplete="off"
                  placeholder="Digite ou selecione um parceiro"
                  disabled={!isEditing}
                />
                {isEditing && showPartnerSuggestions && filteredPartners.length > 0 && (
                  <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                    {filteredPartners.map(p => (
                      <button type="button" key={p.id} className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                        onMouseDown={(e) => e.preventDefault()} onClick={() => handlePartnerSelect(p.name)}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DetailItem>

            <DetailItem label="Status" value={formData.status} icon={getStatusIcon(formData.status)} name="status" isEditableField={true}>
              <select
                className="form-select form-select-sm"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                {ALL_OS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </DetailItem>

            <DetailItem label="Data de Abertura" value={initialOs.dataAbertura} icon={<CalendarClock size={16} className="me-2 text-secondary" />} name="dataAbertura" isEditableField={false} />

            <DetailItem label="Programado Para" value={formData.programadoPara} icon={<CalendarIcon size={16} className="me-2 text-info" />} name="programadoPara" isEditableField={true}>
              <input
                type="date"
                className="form-control form-control-sm"
                name="programadoPara"
                value={formData.programadoPara || ''} // Handles undefined by rendering empty
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </DetailItem>

            {(formData.status === OSStatus.FINALIZADO || initialOs.dataFinalizacao) && (
              <DetailItem label="Data de Finalização" value={formData.dataFinalizacao || initialOs.dataFinalizacao} icon={<CheckCircle2 size={16} className="me-2 text-success" />} name="dataFinalizacao" isEditableField={false} />
            )}
             {formData.status === OSStatus.FINALIZADO && (formData.tempoProducaoMinutos !== undefined && formData.tempoProducaoMinutos >= 0) && (
                <DetailItem label="Tempo de Produção" value={`${Math.floor(formData.tempoProducaoMinutos / 60)}h ${formData.tempoProducaoMinutos % 60}m`} icon={<Clock3 size={16} className="me-2 text-success" />} name="tempoProducaoMinutos" isEditableField={false} />
            )}

            <DetailItem label="Tarefa Principal" value={formData.tarefa} icon={<Briefcase size={16} className="me-2 text-primary" />} name="tarefa" isEditableField={true} className="border-top pt-3 mt-3">
              <textarea
                className="form-control form-control-sm"
                name="tarefa"
                rows={3}
                value={formData.tarefa}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </DetailItem>

            <DetailItem label="Observações" value={formData.observacoes} icon={<MessageSquare size={16} className="me-2 text-primary" />} name="observacoes" isEditableField={true}>
              <textarea
                className="form-control form-control-sm"
                name="observacoes"
                rows={4}
                value={formData.observacoes || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </DetailItem>

            <DetailItem label="Tempo Trabalhado" value={formData.tempoTrabalhado} icon={<Clock3 size={16} className="me-2 text-primary" />} name="tempoTrabalhado" isEditableField={true}>
              <textarea
                className="form-control form-control-sm"
                name="tempoTrabalhado"
                rows={3}
                value={formData.tempoTrabalhado || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Ex: 1h reunião (15/05)&#10;3h código (16/05)&#10;2h ajustes (17/05)"
              />
            </DetailItem>

            <DetailItem label="Urgente" value={formData.isUrgent} icon={<Flag size={16} className={`me-2 ${formData.isUrgent ? 'text-danger' : 'text-secondary'}`} />} name="isUrgent" isEditableField={true}>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="isUrgentSwitch"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <label className="form-check-label small visually-hidden" htmlFor="isUrgentSwitch">
                  {formData.isUrgent ? "Sim" : "Não"}
                </label>
              </div>
            </DetailItem>
          </dl>
        </div>
      </div>
    </div>
  );
}

