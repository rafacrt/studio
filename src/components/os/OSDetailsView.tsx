
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { OS } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User as UserIcon, Users, Briefcase, MessageSquare, Clock3, Save, Edit, Calendar as CalendarIcon } from 'lucide-react'; // Keeping lucide icons, added Edit, CalendarIcon, renamed User
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import type { Partner } from '@/store/os-store'; // Import Partner type
// Removed useToast import
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types'; // Import enums/constants

// Helper for status icons (copied from OSCard for consistency)
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
  const partners = useOSStore((state) => state.partners); // Get Partner[] list
  const addPartner = useOSStore((state) => state.addPartner); // Get addPartner action
  // Removed toast related code

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<OS>(initialOs);
  const [partnerInput, setPartnerInput] = useState(initialOs.parceiro || '');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const partnerInputRef = React.useRef<HTMLInputElement>(null);


  // Reset form data if the initial OS prop changes (e.g., navigating between OS pages)
  useEffect(() => {
    // Format programadoPara for HTML date input (YYYY-MM-DD)
     const formattedInitialOs = {
        ...initialOs,
        programadoPara: initialOs.programadoPara ? initialOs.programadoPara.split('T')[0] : '',
     };
    setFormData(formattedInitialOs);
    setPartnerInput(initialOs.parceiro || '');
    setIsEditing(false); // Reset editing state on OS change
    setShowPartnerSuggestions(false);
  }, [initialOs]);


  // Memoize filtered partners for suggestions
  const filteredPartners = useMemo(() => {
    if (!partnerInput) return [];
    const lowerInput = partnerInput.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(lowerInput));
  }, [partnerInput, partners]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'parceiro') {
        const newValue = value;
        setPartnerInput(newValue); // Update separate state for suggestion input
        // Update suggestion visibility
        setShowPartnerSuggestions(!!newValue && filteredPartners.length > 0 && document.activeElement === partnerInputRef.current);
         // Update formData as well for consistency
         setFormData(prev => ({ ...prev, parceiro: newValue }));
    } else if (type === 'checkbox') {
         setFormData(prev => ({
            ...prev,
            [name]: (e.target as HTMLInputElement).checked,
        }));
    }
    // Handle date input specifically
    else if (type === 'date' && name === 'programadoPara') {
         setFormData(prev => ({
           ...prev,
           [name]: value || undefined // Store as YYYY-MM-DD or undefined if cleared
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
    partnerInputRef.current?.focus(); // Keep focus
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure partner input state is synced to formData before saving
       const dataToSave: OS = {
           ...formData,
           parceiro: partnerInput || undefined, // Use partnerInput state value
           // Ensure programadoPara is undefined if empty, otherwise keep the YYYY-MM-DD string
           programadoPara: formData.programadoPara || undefined,
       };

       // updateOS action now handles adding partner if needed
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
     // Format programadoPara correctly when resetting
     const formattedInitialOs = {
        ...initialOs,
        programadoPara: initialOs.programadoPara ? initialOs.programadoPara.split('T')[0] : '',
     };
    setFormData(formattedInitialOs); // Reset form to initial data
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
     // Special formatting for dates display
     let displayValue = value;
     if ((name === 'programadoPara' || name === 'dataAbertura' || name === 'dataFinalizacao') && typeof value === 'string' && value) {
        try {
            const date = parseISO(value);
            if (isValid(date)) {
                const formatString = name === 'programadoPara' ? "dd/MM/yyyy" : "dd/MM/yyyy 'às' HH:mm";
                displayValue = format(date, formatString, { locale: ptBR });
            }
        } catch {
             displayValue = value; // Fallback to original string if parsing fails
        }
     } else if (typeof value === 'boolean') {
        displayValue = value ? 'Sim' : 'Não';
     }

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
             {/* Project Name - Editable */}
             {isEditing ? (
                  <input
                      type="text"
                      className="form-control form-control-lg mb-1 fw-bold" // Larger input for title
                      name="projeto"
                      value={formData.projeto}
                      onChange={handleInputChange}
                      placeholder="Nome do Projeto"
                      style={{ fontSize: '1.25rem' }} // Match h4 size
                   />
             ) : (
                  <h1 className="card-title h4 mb-1 text-primary fw-bold">{formData.projeto}</h1>
             )}
            <p className="card-subtitle text-muted mb-0">
              Ordem de Serviço: {initialOs.numero}
            </p>
          </div>
          {initialOs.isUrgent && !isEditing && ( // Hide urgent badge when editing
            <span className="badge bg-danger text-white fs-6 px-3 py-1 d-flex align-items-center shadow-sm">
              <Flag size={16} className="me-1" /> URGENTE
            </span>
          )}
        </div>
        <div className="card-body p-4">
          {/* Use dl for description list */}
          <dl className="mb-0">
            {/* Cliente - Editable */}
            <DetailItem label="Cliente" value={formData.cliente} icon={<UserIcon size={16} className="me-2 text-primary" />} name="cliente" isEditable={true}>
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
                <div className="position-relative"> {/* Position relative for suggestions */}
                    <input
                        ref={partnerInputRef} // Assign ref
                        type="text"
                        className="form-control form-control-sm"
                        name="parceiro" // Name matches state key
                        value={partnerInput} // Controlled by partnerInput state
                        onChange={handleInputChange}
                        onFocus={() => setShowPartnerSuggestions(!!partnerInput && filteredPartners.length > 0)}
                        onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 150)} // Hide with delay
                        autoComplete="off"
                        placeholder="Digite ou selecione um parceiro"
                        disabled={!isEditing} // Field disabled when not editing
                    />
                    {showPartnerSuggestions && filteredPartners.length > 0 && (
                        <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
                        {filteredPartners.map(p => (
                            <button
                            type="button" // Important: type="button" to prevent form submission
                            key={p.id} // Use partner ID
                            className="list-group-item list-group-item-action list-group-item-light py-1 px-2 small"
                            onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                            onClick={() => handlePartnerSelect(p.name)} // Select partner name
                            >
                            {p.name}
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
            <DetailItem label="Data de Abertura" value={initialOs.dataAbertura} icon={<CalendarClock size={16} className="me-2 text-secondary" />} name="dataAbertura" isEditable={false} />

            {/* Data Programado Para - Editable */}
            <DetailItem label="Programado Para" value={formData.programadoPara} icon={<CalendarIcon size={16} className="me-2 text-info" />} name="programadoPara" isEditable={true}>
                 <input
                    type="date"
                    className="form-control form-control-sm"
                    name="programadoPara"
                    value={formData.programadoPara || ''} // Bind to YYYY-MM-DD or empty string
                    onChange={handleInputChange}
                    disabled={!isEditing} // Field disabled when not editing
                 />
            </DetailItem>

            {/* Data Finalizacao - Not Editable */}
            {initialOs.dataFinalizacao && (
              <DetailItem label="Data de Finalização" value={initialOs.dataFinalizacao} icon={<CheckCircle2 size={16} className="me-2 text-success" />} name="dataFinalizacao" isEditable={false}/>
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
