
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { OS } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User as UserIcon, Users, Briefcase, MessageSquare, Clock3, Save, Edit, Calendar as CalendarIcon, Printer, CheckSquare } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import type { Partner } from '@/store/os-store';
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
  // updateOSStatus is still used by handleFinalizeOS for a direct status change.
  // If we want to consolidate, handleFinalizeOS could also call updateOS with just status change.
  const updateOSStatus = useOSStore((state) => state.updateOSStatus);
  const partners = useOSStore((state) => state.partners);
  // addPartner is not directly used here but good to keep if future enhancements require it.
  // const addPartner = useOSStore((state) => state.addPartner); 

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<OS>(initialOs);
  const [partnerInput, setPartnerInput] = useState(initialOs.parceiro || '');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const partnerInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format initialOs for the form, especially programadoPara
    const formattedDate = initialOs.programadoPara
        ? initialOs.programadoPara.split('T')[0] // Take YYYY-MM-DD part
        : ''; // Default to empty string if undefined

    const currentFormData = {
      ...initialOs,
      programadoPara: formattedDate,
    };
    setFormData(currentFormData);
    setPartnerInput(initialOs.parceiro || '');
    setIsEditing(false); // Reset editing state when OS changes
    setShowPartnerSuggestions(false); // Reset suggestions visibility
  }, [initialOs]);


  const filteredPartners = useMemo(() => {
    if (!partnerInput) return [];
    const lowerInput = partnerInput.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(lowerInput));
  }, [partnerInput, partners]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'parceiro') {
      const newValue = value;
      setPartnerInput(newValue);
      setShowPartnerSuggestions(!!newValue && filteredPartners.length > 0 && document.activeElement === partnerInputRef.current);
      // Update formData directly for partner as well, as it's part of the OS object
      setFormData(prev => ({ ...prev, parceiro: newValue || undefined }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'date' && name === 'programadoPara') {
      // Ensure undefined is stored if date is cleared, otherwise store YYYY-MM-DD
      setFormData(prev => ({
        ...prev,
        [name]: value || undefined 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePartnerSelect = (partnerName: string) => {
    setFormData(prev => ({ ...prev, parceiro: partnerName }));
    setPartnerInput(partnerName);
    setShowPartnerSuggestions(false);
    partnerInputRef.current?.focus();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare data for saving, ensuring `parceiro` and `programadoPara` are correctly formatted
      const dataToSave: OS = {
        ...formData,
        parceiro: partnerInput.trim() || undefined, // Store undefined if empty after trim
        // programadoPara is already in YYYY-MM-DD or undefined in formData
      };
      updateOS(dataToSave); // This will now handle status transitions correctly in the store
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
     const formattedInitialOs = {
      ...initialOs,
      programadoPara: initialOs.programadoPara ? initialOs.programadoPara.split('T')[0] : '',
    };
    setFormData(formattedInitialOs);
    setPartnerInput(initialOs.parceiro || '');
    setShowPartnerSuggestions(false);
    setIsEditing(false);
  };

  const handleFinalizeOS = () => {
    if (formData.status !== OSStatus.FINALIZADO) {
        // Call updateOSStatus for a direct, quick finalization
        updateOSStatus(formData.id, OSStatus.FINALIZADO);
        // Optimistically update local form data to reflect the change immediately
        setFormData(prev => ({
            ...prev,
            status: OSStatus.FINALIZADO,
            // dataFinalizacao and tempoProducaoMinutos will be set by the store logic triggered by updateOSStatus
            // but we can optimistically set dataFinalizacao here if needed for UI responsiveness.
            // The store is the source of truth for calculated values.
            dataFinalizacao: prev.dataFinalizacao || new Date().toISOString() 
        }));
        console.log(`OS ${formData.numero} finalizada.`);
        // Optionally, turn off editing mode if OS is finalized
        // setIsEditing(false); 
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(event.target as Node)) {
        setShowPartnerSuggestions(false);
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
  }, []);

  const DetailItem = ({ label, value, icon, name, isEditableField, children, className }: {
    label: string;
    value?: string | null | boolean;
    icon?: React.ReactNode;
    name?: keyof OS; // Ensure name is a key of OS for type safety
    isEditableField: boolean; 
    children?: React.ReactNode;
    className?: string;
  }) => {
    let displayValue: string | React.ReactNode = value;
    if ((name === 'programadoPara' || name === 'dataAbertura' || name === 'dataFinalizacao') && typeof value === 'string' && value) {
      try {
        const date = parseISO(value); // parseISO handles both 'YYYY-MM-DD' and full ISO strings
        if (isValid(date)) {
          // For 'programadoPara' which is YYYY-MM-DD, we only need date part
          // For others, include time.
          const formatString = name === 'programadoPara' ? "dd/MM/yyyy" : "dd/MM/yyyy 'às' HH:mm";
          displayValue = format(date, formatString, { locale: ptBR });
        } else {
          // If value is 'YYYY-MM-DD' but parseISO fails (e.g. invalid date like 2023-13-01)
          // or if it's some other non-ISO string, keep original or mark as invalid.
          // For now, just display the original value if parseISO fails.
          displayValue = value;
        }
      } catch {
        displayValue = value; // Fallback to original value on error
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
            <span className={`text-break form-control-plaintext p-0`}> {/* Use form-control-plaintext for consistent styling */}
                {displayValue || <span className="text-muted fst-italic">N/A</span>}
            </span>
          )}
        </dd>
      </div>
    );
  };

  return (
    // Apply os-details-urgent to this container, CSS will target .card within it
    <div className={`container-fluid os-details-print-container ${formData.isUrgent ? 'os-details-urgent' : ''}`}>
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
              <button className="btn btn-success btn-sm" onClick={handleSave} disabled={isSaving || !formData.cliente || !formData.projeto || !formData.tarefa}>
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

      {/* The .card element will now pick up the urgent styling from .os-details-urgent .card CSS rule */}
      <div className={`card shadow-lg mb-4`}>
        <div className={`card-header p-3 border-bottom d-flex justify-content-between align-items-start ${!isEditing && formData.isUrgent ? '' : 'bg-light'}`}>
          {/* If not editing and urgent, card-header will get styles from .os-details-urgent .card-header */}
          {/* Otherwise, it's bg-light */}
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
            <DetailItem label="Cliente" value={formData.cliente} icon={<UserIcon size={16} className="me-2 text-primary" />} name="cliente" isEditableField={true}>
              <input
                type="text"
                className="form-control form-control-sm"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </DetailItem>

            <DetailItem label="Parceiro" value={formData.parceiro} icon={<Users size={16} className="me-2 text-primary" />} name="parceiro" isEditableField={true}>
              <div className="position-relative">
                <input
                  ref={partnerInputRef}
                  type="text"
                  className="form-control form-control-sm"
                  name="parceiro"
                  value={partnerInput} // Controlled by partnerInput state
                  onChange={handleInputChange} // This updates partnerInput and formData.parceiro
                  onFocus={() => setShowPartnerSuggestions(!!partnerInput && filteredPartners.length > 0)}
                  onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 150)}
                  autoComplete="off"
                  placeholder="Digite ou selecione um parceiro"
                  disabled={!isEditing}
                />
                {isEditing && showPartnerSuggestions && filteredPartners.length > 0 && (
                  <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                    {filteredPartners.map(p => (
                      <button
                        type="button"
                        key={p.id}
                        className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handlePartnerSelect(p.name)}
                      >
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
                value={formData.programadoPara || ''} // Ensure value is empty string if undefined for date input
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </DetailItem>

            {/* Display finalization date if OS is finalized or was finalized */}
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
