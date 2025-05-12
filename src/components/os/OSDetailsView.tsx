
'use client';

import React, { useState, useEffect } from 'react';
import type { OS } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User, Users, Briefcase, MessageSquare, Clock3, Save } from 'lucide-react'; // Keeping lucide icons
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
        setPartnerInput(value); // Update separate state for suggestion input
        setShowPartnerSuggestions(!!value);
    }

    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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
    setIsEditing(false);
  };

   // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(event.target as Node)) {
        setShowPartnerSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPartners = partners.filter(p =>
    p.toLowerCase().includes(partnerInput.toLowerCase())
  );


  // Detail Item component adapted for Bootstrap structure and editability
  const DetailItem = ({ label, value, icon, name, children, className }: { label: string; value?: string | null; icon?: React.ReactNode; name?: keyof OS; children?: React.ReactNode; className?: string }) => (
    <div className={`row py-2 ${className || ''}`}>
      <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium">{icon}{label}</dt>
      <dd className="col-sm-9">
        {isEditing && name && children ? (
          children // Render custom input element if provided
        ) : isEditing && name ? (
           // Default input for simple text fields
           <input
             type="text"
             className="form-control form-control-sm"
             name={name}
             value={formData[name]?.toString() || ''}
             onChange={handleInputChange}
           />
        ) : (
          <span className="text-break">{value || <span className="text-muted fst-italic">N/A</span>}</span>
        )}
      </dd>
    </div>
  );


  return (
    <div className="container-fluid">
        <div className="mb-4">
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
                <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
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
            <span className="badge bg-danger text-white fs-6 px-3 py-1 d-flex align-items-center">
              <Flag size={16} className="me-1" /> URGENTE
            </span>
          )}
        </div>
        <div className="card-body p-4">
          <dl className="mb-0">
            {/* Cliente - Editable */}
            <DetailItem label="Cliente" value={formData.cliente} icon={<User size={16} className="me-2 text-primary" />} name="cliente">
               <input
                type="text"
                className="form-control form-control-sm"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </DetailItem>

            {/* Parceiro - Editable with Suggestions */}
            <div className="row py-2">
                <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium"><Users size={16} className="me-2 text-primary" />Parceiro</dt>
                <dd className="col-sm-9 position-relative" ref={partnerInputRef}>
                    {isEditing ? (
                        <>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="parceiro"
                            value={partnerInput}
                            onChange={handleInputChange}
                            onFocus={() => setShowPartnerSuggestions(!!partnerInput && filteredPartners.length > 0)}
                            autoComplete="off"
                            placeholder="Digite ou selecione um parceiro"
                            disabled={!isEditing}
                        />
                        {showPartnerSuggestions && filteredPartners.length > 0 && (
                            <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>
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
                        </>
                    ) : (
                        <span className="text-break">{formData.parceiro || <span className="text-muted fst-italic">N/A</span>}</span>
                    )}
                </dd>
            </div>

            {/* Status - Editable */}
             <DetailItem label="Status" value={formData.status} icon={getStatusIcon(formData.status)} name="status">
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

            {/* Data Abertura - Not Editable */}
            <DetailItem label="Data de Abertura" value={format(parseISO(initialOs.dataAbertura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CalendarClock size={16} className="me-2 text-primary" />} />

            {/* Data Finalizacao - Not Editable */}
            {initialOs.dataFinalizacao && (
              <DetailItem label="Data de Finalização" value={format(parseISO(initialOs.dataFinalizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CheckCircle2 size={16} className="me-2 text-success" />} />
            )}

             {/* Tarefa - Editable */}
            <div className="row py-2">
                <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium"><Briefcase size={16} className="me-2 text-primary" />Tarefa Principal</dt>
                <dd className="col-sm-9">
                {isEditing ? (
                    <textarea
                    className="form-control form-control-sm"
                    name="tarefa"
                    rows={3}
                    value={formData.tarefa}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    />
                ) : (
                    <p className="mb-0 text-break bg-light p-2 rounded border">{formData.tarefa || <span className="text-muted fst-italic">Nenhuma tarefa principal fornecida.</span>}</p>
                )}
                </dd>
            </div>

             {/* Observacoes - Editable */}
             <div className="row py-2">
                <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium"><MessageSquare size={16} className="me-2 text-primary" />Observações</dt>
                 <dd className="col-sm-9">
                    {isEditing ? (
                        <textarea
                        className="form-control form-control-sm"
                        name="observacoes"
                        rows={4}
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        />
                    ) : (
                         <p className="mb-0 text-break bg-light p-2 rounded border">{formData.observacoes || <span className="text-muted fst-italic">Nenhuma observação fornecida.</span>}</p>
                    )}
                </dd>
            </div>

             {/* Tempo Trabalhado - Editable */}
            <div className="row py-2">
                <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium"><Clock3 size={16} className="me-2 text-primary" />Tempo Trabalhado</dt>
                 <dd className="col-sm-9">
                    {isEditing ? (
                        <textarea
                        className="form-control form-control-sm"
                        name="tempoTrabalhado"
                        rows={2}
                        value={formData.tempoTrabalhado || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Ex: 1h reunião, 3h código"
                        />
                    ) : (
                         <p className="mb-0 text-break bg-light p-2 rounded border">{formData.tempoTrabalhado || <span className="text-muted fst-italic">Nenhum tempo registrado.</span>}</p>
                    )}
                </dd>
            </div>

             {/* Urgente - Editable */}
            <div className="row py-2 align-items-center">
                <dt className="col-sm-3 text-muted d-flex align-items-center small fw-medium"><Flag size={16} className="me-2 text-danger" />Urgente</dt>
                 <dd className="col-sm-9">
                    {isEditing ? (
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
                          <label className="form-check-label small" htmlFor="isUrgentSwitch">
                             {formData.isUrgent ? "Sim" : "Não"}
                          </label>
                        </div>
                    ) : (
                         <span>{formData.isUrgent ? 'Sim' : 'Não'}</span>
                    )}
                </dd>
            </div>

          </dl>
        </div>
         <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2">
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
                    <Users size={16} className="me-1" /> {/* Placeholder icon */}
                    Editar OS
                 </button>
            )}
        </div>
      </div>
    </div>
  );
}
