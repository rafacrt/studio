
'use client';

import React, { useState, useEffect } from 'react';
import type { OS } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User, Users, Briefcase, MessageSquare, Clock3, Save, Edit } from 'lucide-react'; // Keeping lucide icons, added Edit
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
// Removed useToast import
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types'; // Import enums/constants

// Helper for status icons (copied from OSCard for consistency)
const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.NA_FILA: return <Clock size={16} className="me-2" />;
    case OSStatus.AGUARDANDO_CLIENTE: return <User size={16} className="me-2" />;
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
  const partners = useOSStore((state) => state.partners); // Get partners for suggestions
  const addPartner = useOSStore((state) => state.addPartner);
  // Removed toast related code

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<OS>(initialOs);
  const [partnerInput, setPartnerInput] = useState(initialOs.parceiro || '');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const partnerInputRef = React.useRef<HTMLInputElement>(null);


  // Reset form data if the initial OS prop changes (e.g., navigating between OS pages)
  useEffect(() => {
    setFormData(initialOs);
    setPartnerInput(initialOs.parceiro || '');
    setIsEditing(false); // Reset editing state on OS change
  }, [initialOs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'parceiro') {
        const newValue = value;
        setPartnerInput(newValue); // Update separate state for suggestion input
        const currentFiltered = partners.filter(p => p.toLowerCase().includes(newValue.toLowerCase()));
        setShowPartnerSuggestions(!!newValue && currentFiltered.length > 0);
         // Update formData as well for consistency if needed immediately,
         // otherwise it gets updated fully on save from partnerInput state.
         setFormData(prev => ({ ...prev, parceiro: newValue }));
    } else if (type === 'checkbox') {
         setFormData(prev => ({
            ...prev,
            [name]: (e.target as HTMLInputElement).checked,
        }));
    }
    else {
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
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure partner input state is synced to formData before saving
       const dataToSave: OS = {
           ...formData,
           parceiro: partnerInput || undefined, // Use partnerInput state value
       };

       // Add new partner if necessary
       if (dataToSave.parceiro && !partners.includes(dataToSave.parceiro)) {
           addPartner(dataToSave.parceiro);
       }

      updateOS(dataToSave);
      // Removed success toast
      console.log(`OS Atualizada: ${dataToSave.numero}`);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update OS:", error);
      // Removed error toast
      alert('Falha ao atualizar OS. Tente novamente.'); // Basic alert fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialOs); // Reset form to initial data
    setPartnerInput(initialOs.parceiro || ''); // Reset partner input
    setShowPartnerSuggestions(false); // Hide suggestions
    setIsEditing(false);
  };

   // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the partner input container
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
  }, []); // Empty dependency array means this runs once on mount/unmount

  const filteredPartners = partnerInput
    ? partners.filter(p => p.toLowerCase().includes(partnerInput.toLowerCase()))
    : [];


  // Detail Item component adapted for Bootstrap structure and editability
  const DetailItem = ({ label, value, icon, name, isEditable, children, className }: {
      label: string;
      value?: string | null | boolean;
      icon?: React.ReactNode;
      name?: keyof OS;
      isEditable: boolean; // Controls if the field can be edited
      children?: React.ReactNode; // Allows passing custom input components
      className?: string
   }) => {
    const displayValue = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value;

    return (
        <div className={`row py-2 ${className || ''}`}>
        <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium">{icon}{label}</dt>
        <dd className="col-sm-9">
            {isEditing && isEditable ? (
                children // Render custom input element if provided and editable
            ) : (
                 <span className="text-break">{displayValue || <span className="text-muted fst-italic">N/A</span>}</span>
            )}
        </dd>
        </div>
    );
 };


  return (
    <div className="container-fluid">
        <div className="mb-4 d-flex justify-content-between align-items-center">
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
                <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
             {/* Edit/Save/Cancel Buttons */}
             <div className="d-flex gap-2">
                {isEditing ? (
                    <>
                        <button className="btn btn-outline-secondary btn-sm" onClick={handleCancel} disabled={isSaving}>
                            Cancelar
                        </button>
                        <button className="btn btn-success btn-sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> : <Save size={16} className="me-1" />}
                            Salvar Alterações
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                        <Edit size={16} className="me-1" /> {/* Changed icon to Edit */}
                        Editar OS
                    </button>
                )}
            </div>
        </div>

      <div className="card shadow-lg mb-4">
        <div className="card-header bg-light p-3 border-bottom d-flex justify-content-between align-items-start">
          <div>
            <h1 className="card-title h4 mb-1 text-primary fw-bold">{initialOs.projeto}</h1>
            <p className="card-subtitle text-muted mb-0">
              Ordem de Serviço: {initialOs.numero}
            </p>
          </div>
          {initialOs.isUrgent && (
            <span className="badge bg-danger text-white fs-6 px-3 py-1 d-flex align-items-center shadow-sm">
              <Flag size={16} className="me-1" /> URGENTE
            </span>
          )}
        </div>
        <div className="card-body p-4">
          {/* Use dl for description list */}
          <dl className="mb-0">
            {/* Cliente - Editable */}
            <DetailItem label="Cliente" value={formData.cliente} icon={<User size={16} className="me-2 text-primary" />} name="cliente" isEditable={true}>
               <input
                type="text"
                className="form-control form-control-sm"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                disabled={!isEditing} // Field is disabled when not editing
              />
            </DetailItem>

            {/* Parceiro - Editable with Suggestions */}
            <DetailItem label="Parceiro" value={formData.parceiro} icon={<Users size={16} className="me-2 text-primary" />} name="parceiro" isEditable={true}>
                <div className="position-relative" ref={partnerInputRef}> {/* Position relative for suggestions */}
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        name="parceiro" // Name matches state key
                        value={partnerInput} // Controlled by partnerInput state
                        onChange={handleInputChange}
                        onFocus={() => setShowPartnerSuggestions(!!partnerInput && filteredPartners.length > 0)}
                        autoComplete="off"
                        placeholder="Digite ou selecione um parceiro"
                        disabled={!isEditing} // Field disabled when not editing
                    />
                    {showPartnerSuggestions && filteredPartners.length > 0 && (
                        <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                        {filteredPartners.map(p => (
                            <button
                            type="button" // Important: type="button" to prevent form submission
                            key={p}
                            className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                            onClick={() => handlePartnerSelect(p)}
                            >
                            {p}
                            </button>
                        ))}
                        </div>
                    )}
                </div>
             </DetailItem>

            {/* Status - Editable */}
             <DetailItem label="Status" value={formData.status} icon={getStatusIcon(formData.status)} name="status" isEditable={true}>
                <select
                    className="form-select form-select-sm"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Field disabled when not editing
                >
                    {ALL_OS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </DetailItem>

            {/* Data Abertura - Not Editable */}
            <DetailItem label="Data de Abertura" value={format(parseISO(initialOs.dataAbertura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CalendarClock size={16} className="me-2 text-secondary" />} isEditable={false} />

            {/* Data Finalizacao - Not Editable */}
            {initialOs.dataFinalizacao && (
              <DetailItem label="Data de Finalização" value={format(parseISO(initialOs.dataFinalizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CheckCircle2 size={16} className="me-2 text-success" />} isEditable={false}/>
            )}

             {/* Tarefa - Editable */}
            <DetailItem label="Tarefa Principal" value={formData.tarefa} icon={<Briefcase size={16} className="me-2 text-primary" />} name="tarefa" isEditable={true} className="border-top pt-3 mt-3"> {/* Add separator */}
                 <textarea
                    className="form-control form-control-sm"
                    name="tarefa"
                    rows={3}
                    value={formData.tarefa}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Field disabled when not editing
                 />
            </DetailItem>

             {/* Observacoes - Editable */}
             <DetailItem label="Observações" value={formData.observacoes} icon={<MessageSquare size={16} className="me-2 text-primary" />} name="observacoes" isEditable={true}>
                 <textarea
                    className="form-control form-control-sm"
                    name="observacoes"
                    rows={4}
                    value={formData.observacoes || ''} // Handle potential null/undefined
                    onChange={handleInputChange}
                    disabled={!isEditing} // Field disabled when not editing
                 />
            </DetailItem>

             {/* Tempo Trabalhado - Editable */}
            <DetailItem label="Tempo Trabalhado" value={formData.tempoTrabalhado} icon={<Clock3 size={16} className="me-2 text-primary" />} name="tempoTrabalhado" isEditable={true}>
                 <textarea
                    className="form-control form-control-sm"
                    name="tempoTrabalhado"
                    rows={3} // Increased rows
                    value={formData.tempoTrabalhado || ''} // Handle potential null/undefined
                    onChange={handleInputChange}
                    disabled={!isEditing} // Field disabled when not editing
                    placeholder="Ex: 1h reunião (15/05)&#10;3h código (16/05)&#10;2h ajustes (17/05)" // Added line breaks in placeholder
                 />
            </DetailItem>

             {/* Urgente - Editable */}
            <DetailItem label="Urgente" value={formData.isUrgent} icon={<Flag size={16} className={`me-2 ${formData.isUrgent ? 'text-danger' : 'text-secondary'}`} />} name="isUrgent" isEditable={true}>
                   <div className="form-check form-switch">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="isUrgentSwitch"
                        name="isUrgent"
                        checked={formData.isUrgent}
                        onChange={handleInputChange}
                        disabled={!isEditing} // Field disabled when not editing
                      />
                      <label className="form-check-label small visually-hidden" htmlFor="isUrgentSwitch"> {/* Hide label text */}
                         {formData.isUrgent ? "Sim" : "Não"}
                      </label>
                    </div>
            </DetailItem>

          </dl>
        </div>
         {/* Footer removed as buttons are moved to the top */}
      </div>
    </div>
  );
}
