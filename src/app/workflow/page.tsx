
'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Check, Edit3, Save, ThumbsUp, ThumbsDown, MessageSquare, GitBranch } from 'lucide-react'; // Added GitBranch import
import Image from 'next/image'; // Using next/image for optimization

// Define the structure for an artwork item
interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'changes_requested';
  feedback: string;
  showFeedbackInput: boolean;
}

// Mock data for artworks
const initialArtworks: Artwork[] = [
  { id: 'art-1', title: 'Banner Principal Website', imageUrl: 'https://picsum.photos/seed/banner1/600/300', status: 'pending', feedback: '', showFeedbackInput: false },
  { id: 'art-2', title: 'Post Instagram - Promoção', imageUrl: 'https://picsum.photos/seed/insta1/400/400', status: 'pending', feedback: '', showFeedbackInput: false },
  { id: 'art-3', title: 'Ícone App Mobile', imageUrl: 'https://picsum.photos/seed/icon1/200/200', status: 'pending', feedback: '', showFeedbackInput: false },
  { id: 'art-4', title: 'Anúncio Revista', imageUrl: 'https://picsum.photos/seed/revista1/500/400', status: 'pending', feedback: '', showFeedbackInput: false },
];

export default function WorkflowPage() {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleApprove = (id: string) => {
    setArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, status: 'approved', feedback: '', showFeedbackInput: false } : art
      )
    );
  };

  const handleRequestChanges = (id: string) => {
    setArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, status: 'changes_requested', showFeedbackInput: true } : art
      )
    );
  };

  const handleFeedbackChange = (id: string, feedback: string) => {
    setArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === id ? { ...art, feedback } : art
      )
    );
  };

  const handleSaveWorkflow = () => {
    setIsSaving(true);
    console.log("Salvando estado do Workflow:");
    // Log only relevant data (status and feedback)
    const reviewData = artworks.map(({ id, title, status, feedback }) => ({
      id,
      title,
      status,
      feedback: status === 'changes_requested' ? feedback : undefined, // Only include feedback if changes were requested
    }));
    console.log(JSON.stringify(reviewData, null, 2));

    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false);
      alert("Feedback e aprovações foram registrados (ver console).");
      // In a real app, you would send `reviewData` to your backend here.
    }, 1000);
  };

  if (!isHydrated) {
      return (
        <AuthenticatedLayout>
          {/* Loading Spinner */}
          <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Carregando Workflow...</span>
            </div>
            <p className="text-muted">Carregando Workflow...</p>
          </div>
        </AuthenticatedLayout>
      );
    }

  return (
    <AuthenticatedLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0 d-flex align-items-center">
          <GitBranch className="me-2 text-secondary" /> Workflow de Aprovação de Arte
        </h1>
        {/* Maybe add a link back to home or dashboard later */}
      </div>

      <p className="text-muted mb-4">
        Revise as artes abaixo. Você pode aprovar ou solicitar alterações para cada item. Clique em "Salvar" ao final para registrar suas decisões.
      </p>

      <div className="list-group">
        {artworks.map(art => (
          <div key={art.id} className={`list-group-item list-group-item-action d-flex flex-column flex-md-row gap-3 p-3 mb-3 shadow-sm border rounded ${art.status === 'approved' ? 'border-success bg-success-subtle' : art.status === 'changes_requested' ? 'border-warning bg-warning-subtle' : ''}`}>

            {/* Artwork Image */}
            <div className="text-center flex-shrink-0" style={{ maxWidth: '250px', width: '100%' }}>
               <h5 className="h6 mb-2 d-md-none text-center">{art.title}</h5> {/* Title for mobile */}
               <Image
                 src={art.imageUrl}
                 alt={`Arte para ${art.title}`}
                 width={250} // Provide appropriate width
                 height={150} // Provide appropriate height
                 className="img-thumbnail mb-2"
                 style={{ objectFit: 'contain', maxHeight: '150px' }} // Ensure image fits container
                 data-ai-hint="abstract design" // Hint for AI image generation
               />
            </div>

            {/* Artwork Details and Actions */}
            <div className="flex-grow-1 d-flex flex-column">
              <h5 className="h6 mb-2 d-none d-md-block">{art.title}</h5> {/* Title for desktop */}

              {/* Status Indicator */}
              <div className="mb-3">
                {art.status === 'approved' && (
                  <span className="badge bg-success d-inline-flex align-items-center">
                    <ThumbsUp size={14} className="me-1" /> Aprovado
                  </span>
                )}
                {art.status === 'changes_requested' && (
                  <span className="badge bg-warning text-dark d-inline-flex align-items-center">
                    <Edit3 size={14} className="me-1" /> Alterações Solicitadas
                  </span>
                )}
                 {art.status === 'pending' && (
                  <span className="badge bg-secondary d-inline-flex align-items-center">
                    Pendente
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {art.status !== 'approved' && (
                 <div className="d-flex flex-wrap gap-2 mb-3">
                    <button
                      className="btn btn-sm btn-outline-success d-inline-flex align-items-center"
                      onClick={() => handleApprove(art.id)}
                      disabled={art.status === 'approved'}
                    >
                      <ThumbsUp size={16} className="me-1" /> Aprovar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning d-inline-flex align-items-center"
                      onClick={() => handleRequestChanges(art.id)}
                      disabled={art.status === 'changes_requested' && art.showFeedbackInput}
                    >
                      <Edit3 size={16} className="me-1" /> Pedir Alterações
                    </button>
                 </div>
              )}


              {/* Feedback Input Area */}
              {art.status === 'changes_requested' && art.showFeedbackInput && (
                <div className="mt-2">
                  <label htmlFor={`feedback-${art.id}`} className="form-label fw-medium small d-flex align-items-center">
                     <MessageSquare size={14} className="me-1" /> Descreva as alterações necessárias:
                  </label>
                  <textarea
                    id={`feedback-${art.id}`}
                    className="form-control form-control-sm"
                    rows={3}
                    value={art.feedback}
                    onChange={(e) => handleFeedbackChange(art.id, e.target.value)}
                    placeholder="Ex: Ajustar a cor do botão para azul, aumentar o logo..."
                  />
                </div>
              )}
               {/* Display saved feedback if changes were requested but input is hidden */}
               {art.status === 'changes_requested' && !art.showFeedbackInput && art.feedback && (
                  <div className="mt-2 p-2 border rounded bg-light small">
                     <p className="mb-0 fst-italic"><strong>Feedback anterior:</strong> {art.feedback}</p>
                  </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
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
              <Save size={18} className="me-2" /> Salvar Revisão do Workflow
            </>
          )}
        </button>
      </div>
    </AuthenticatedLayout>
  );
}
