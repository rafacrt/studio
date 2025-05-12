
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Edit3, Save, ThumbsUp, ThumbsDown, MessageSquare, GitBranch, CalendarDays, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { useArtworkContext } from '@/context/ArtworkContext';
import type { Artwork } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WorkflowApprovalPage() {
  const router = useRouter();
  const { artworks: allArtworks, updateArtwork, getArtworksByClientId } = useArtworkContext();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [currentClientName, setCurrentClientName] = useState<string | null>(null);
  
  // Local state for artworks specific to this client to manage UI changes (feedback input visibility)
  const [clientArtworks, setClientArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    const role = localStorage.getItem('workflowUserRole');
    const clientId = localStorage.getItem('workflowClientId');
    const clientName = localStorage.getItem('workflowClientName');

    if (role !== 'client' || !clientId) {
      router.replace('/workflow/login');
      return;
    }
    setCurrentClientId(clientId);
    setCurrentClientName(clientName || 'Cliente');
  }, [router]);

  useEffect(() => {
    if (currentClientId) {
      const filteredArtworks = getArtworksByClientId(currentClientId)
                                .sort((a,b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime());
      setClientArtworks(filteredArtworks);
    }
  }, [currentClientId, allArtworks, getArtworksByClientId]);


  const handleApprove = (id: string) => {
    setClientArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, status: 'approved', feedback: '', showFeedbackInput: false } : art
      )
    );
  };

  const handleRequestChanges = (id: string) => {
    setClientArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, status: 'changes_requested', showFeedbackInput: true } : art
      )
    );
  };

  const handleFeedbackChange = (id: string, feedbackText: string) => {
    setClientArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, feedback: feedbackText } : art
      )
    );
  };

  const handleSaveWorkflow = () => {
    setIsSaving(true);
    console.log("Salvando estado do Workflow para o cliente:", currentClientId);
    
    const reviewData = clientArtworks.map(({ id, title, status, feedback }) => ({
      id,
      title,
      status,
      feedback: status === 'changes_requested' ? feedback : undefined,
    }));
    console.log(JSON.stringify(reviewData, null, 2));

    // Update the global context/storage
    clientArtworks.forEach(art => {
        const originalArt = allArtworks.find(a => a.id === art.id);
        if (originalArt && (originalArt.status !== art.status || originalArt.feedback !== art.feedback)) {
             updateArtwork(art); // This will trigger localStorage save in context
        }
    });

    setTimeout(() => {
      setIsSaving(false);
      alert("Feedback e aprovações foram registrados (ver console e localStorage).");
    }, 1000);
  };

  if (!isHydrated || !currentClientId) {
      return (
          <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Carregando Workflow...</span>
            </div>
            <p className="text-muted">Carregando seu workflow de aprovação...</p>
          </div>
      );
  }

  const pendingArtworks = clientArtworks.filter(art => art.status === 'pending' || art.status === 'changes_requested');
  const approvedArtworks = clientArtworks.filter(art => art.status === 'approved');

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
            <h1 className="h3 mb-1 d-flex align-items-center">
                <GitBranch className="me-2 text-secondary" /> Workflow de Aprovação de Arte
            </h1>
            <p className="text-muted small mb-0 d-flex align-items-center">
                <UserCircle size={16} className="me-1"/> Olá, {currentClientName}!
            </p>
        </div>
        <button onClick={() => {
            localStorage.removeItem('workflowUserRole');
            localStorage.removeItem('workflowClientId');
            localStorage.removeItem('workflowClientName');
            router.push('/workflow/login');
        }} className="btn btn-sm btn-outline-secondary">Sair</button>
      </div>

      <p className="text-muted mb-4">
        Revise as artes abaixo. Você pode aprovar ou solicitar alterações para cada item. Clique em "Salvar Revisão" ao final para registrar suas decisões.
      </p>

      {pendingArtworks.length === 0 && approvedArtworks.length === 0 && (
          <div className="alert alert-info text-center">Nenhuma arte pendente de aprovação no momento.</div>
      )}

      {pendingArtworks.length > 0 && (
          <>
            <h2 className="h5 mb-3">Artes Pendentes de Revisão</h2>
            <div className="list-group mb-4">
                {pendingArtworks.map(art => (
                <div key={art.id} className={`list-group-item list-group-item-action d-flex flex-column flex-md-row gap-3 p-3 mb-3 shadow-sm border rounded ${art.status === 'changes_requested' ? 'border-warning bg-warning-subtle' : ''}`}>
                    <div className="text-center flex-shrink-0" style={{ maxWidth: '250px', width: '100%' }}>
                    <h5 className="h6 mb-2 d-md-none text-center">{art.title}</h5>
                    <Image
                        src={art.imageUrl}
                        alt={`Arte para ${art.title}`}
                        width={250}
                        height={150}
                        className="img-thumbnail mb-2"
                        style={{ objectFit: 'contain', maxHeight: '150px' }}
                        data-ai-hint="creative work"
                    />
                    </div>
                    <div className="flex-grow-1 d-flex flex-column">
                    <h5 className="h6 mb-1 d-none d-md-block">{art.title}</h5>
                    <p className="small text-muted mb-2 d-flex align-items-center">
                        <CalendarDays size={14} className="me-1" /> Disponibilizado em: {format(parseISO(art.uploadedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="mb-3">
                        {art.status === 'changes_requested' && (
                        <span className="badge bg-warning text-dark d-inline-flex align-items-center">
                            <Edit3 size={14} className="me-1" /> Alterações Solicitadas
                        </span>
                        )}
                        {art.status === 'pending' && (
                        <span className="badge bg-secondary d-inline-flex align-items-center">
                            Pendente de Revisão
                        </span>
                        )}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <button
                        className="btn btn-sm btn-outline-success d-inline-flex align-items-center"
                        onClick={() => handleApprove(art.id)}
                        >
                        <ThumbsUp size={16} className="me-1" /> Aprovar
                        </button>
                        <button
                        className="btn btn-sm btn-outline-warning d-inline-flex align-items-center"
                        onClick={() => handleRequestChanges(art.id)}
                        disabled={art.showFeedbackInput}
                        >
                        <Edit3 size={16} className="me-1" /> Pedir Alterações
                        </button>
                    </div>
                    {art.status === 'changes_requested' && art.showFeedbackInput && (
                        <div className="mt-2">
                        <label htmlFor={`feedback-${art.id}`} className="form-label fw-medium small d-flex align-items-center">
                            <MessageSquare size={14} className="me-1" /> Descreva as alterações:
                        </label>
                        <textarea
                            id={`feedback-${art.id}`}
                            className="form-control form-control-sm"
                            rows={3}
                            value={art.feedback}
                            onChange={(e) => handleFeedbackChange(art.id, e.target.value)}
                            placeholder="Ex: Ajustar a cor do botão para azul..."
                        />
                        </div>
                    )}
                    {art.status === 'changes_requested' && !art.showFeedbackInput && art.feedback && (
                        <div className="mt-2 p-2 border rounded bg-light-subtle small">
                            <p className="mb-0 fst-italic text-dark"><strong>Feedback anterior:</strong> {art.feedback}</p>
                        </div>
                    )}
                    </div>
                </div>
                ))}
            </div>
          </>
      )}
      
      {pendingArtworks.length > 0 && (
        <div className="mt-4 pt-3 border-top text-end">
            <button
            className="btn btn-primary btn-lg d-inline-flex align-items-center"
            onClick={handleSaveWorkflow}
            disabled={isSaving}
            >
            {isSaving ? (
                <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Salvando...
                </>
            ) : (
                <>
                <Save size={18} className="me-2" /> Salvar Revisão ({pendingArtworks.length})
                </>
            )}
            </button>
        </div>
      )}

      {approvedArtworks.length > 0 && (
          <>
            <h2 className="h5 mt-5 mb-3 pt-3 border-top">Artes Aprovadas</h2>
            <div className="list-group">
                {approvedArtworks.map(art => (
                     <div key={art.id} className="list-group-item d-flex flex-column flex-md-row gap-3 p-3 mb-3 shadow-sm border rounded border-success bg-success-subtle">
                        <div className="text-center flex-shrink-0" style={{ maxWidth: '200px', width: '100%' }}>
                             <h5 className="h6 mb-2 d-md-none text-center">{art.title}</h5>
                             <Image
                                 src={art.imageUrl}
                                 alt={`Arte para ${art.title}`}
                                 width={200}
                                 height={120}
                                 className="img-thumbnail mb-2"
                                 style={{ objectFit: 'contain', maxHeight: '120px' }}
                                 data-ai-hint="approved design"
                             />
                        </div>
                        <div className="flex-grow-1">
                             <h5 className="h6 mb-1 d-none d-md-block">{art.title}</h5>
                             <p className="small text-muted mb-2 d-flex align-items-center">
                                <CalendarDays size={14} className="me-1" /> Aprovado em: {format(parseISO(art.uploadedAt), "dd/MM/yyyy", { locale: ptBR })} {/* This should be approval date, for now using uploadedAt */}
                             </p>
                             <span className="badge bg-success d-inline-flex align-items-center">
                                 <ThumbsUp size={14} className="me-1" /> Aprovado
                             </span>
                        </div>
                     </div>
                ))}
            </div>
          </>
      )}

    </div>
  );
}
