
'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, ListChecks, AlertCircle, PlusCircle, Building, User } from 'lucide-react';
import { useArtworkContext, mockWorkflowClients } from '@/context/ArtworkContext'; // Assuming mockWorkflowClients is exported
import type { Artwork } from '@/lib/types'; // Import Artwork type
import Image from 'next/image'; // For displaying existing artworks
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export default function WorkflowAdminPage() {
  const router = useRouter();
  const { artworks, addArtwork } = useArtworkContext();

  const [title, setTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(mockWorkflowClients[0]?.id || '');
  const [imageUrl, setImageUrl] = useState(''); // For mock URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('workflowUserRole');
    if (role !== 'admin') {
      router.replace('/workflow/login');
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClientId) {
        setFeedbackMessage({ type: 'error', message: 'Por favor, selecione um cliente.' });
        return;
    }
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const selectedClient = mockWorkflowClients.find(c => c.id === selectedClientId);

    // Simulate image upload and get URL
    const mockImageSeed = Date.now() + Math.random().toString(16).substring(2,8);
    const generatedImageUrl = `https://picsum.photos/seed/${mockImageSeed}/600/${Math.floor(Math.random() * (400 - 200 + 1)) + 200}`; // Random height

    try {
        addArtwork({
            clientId: selectedClientId,
            clientName: selectedClient?.name,
            title,
            imageUrl: imageUrl || generatedImageUrl, // Use provided URL or generate mock
            uploadedAt: new Date().toISOString(),
        });

        setFeedbackMessage({ type: 'success', message: `Arte "${title}" enviada com sucesso para ${selectedClient?.name || 'cliente selecionado'}!` });
        setTitle('');
        setImageUrl('');
        // setSelectedClientId(mockWorkflowClients[0]?.id || ''); // Optionally reset client
    } catch (error) {
        console.error("Error adding artwork:", error);
        setFeedbackMessage({ type: 'error', message: 'Ocorreu um erro ao enviar a arte.' });
    } finally {
        setIsSubmitting(false);
    }

  };

  const artworksGroupedByClient = useMemo(() => {
    return artworks.reduce((acc, art) => {
      const clientName = art.clientName || mockWorkflowClients.find(c => c.id === art.clientId)?.name || 'Cliente Desconhecido';
      if (!acc[clientName]) {
        acc[clientName] = [];
      }
      acc[clientName].push(art);
      return acc;
    }, {} as Record<string, Artwork[]>);
  }, [artworks]);


  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0 d-flex align-items-center">
          <UploadCloud className="me-2 text-primary" /> Painel de Administração do Workflow
        </h1>
        <button onClick={() => {
            localStorage.removeItem('workflowUserRole');
            localStorage.removeItem('workflowClientId');
            localStorage.removeItem('workflowClientName');
            router.push('/workflow/login');
        }} className="btn btn-sm btn-outline-secondary">Sair</button>
      </div>

      <div className="row">
        {/* Artwork Upload Form */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h2 className="h5 mb-0 d-flex align-items-center">
                <PlusCircle size={20} className="me-2 text-success" /> Enviar Nova Arte
              </h2>
            </div>
            <div className="card-body">
              {feedbackMessage && (
                <div className={`alert alert-${feedbackMessage.type === 'success' ? 'success' : 'danger'} d-flex align-items-center p-2`} role="alert">
                  {feedbackMessage.type === 'error' && <AlertCircle size={20} className="me-2 flex-shrink-0" />}
                  <small>{feedbackMessage.message}</small>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="client" className="form-label">Cliente *</label>
                  <select
                    id="client"
                    className="form-select"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione um cliente</option>
                    {mockWorkflowClients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Título da Arte *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Proposta de Logo V1"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="imageUrl" className="form-label">URL da Imagem (Opcional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.png (Deixe em branco para mock)"
                  />
                  <div className="form-text small">Se deixado em branco, uma imagem mock será gerada.</div>
                </div>
                {/* In a real app, this would be a file input:
                <div className="mb-3">
                  <label htmlFor="artworkFile" className="form-label">Arquivo da Arte *</label>
                  <input type="file" className="form-control" id="artworkFile" required />
                </div>
                */}
                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} className="me-1" /> Enviar Arte
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* List of Uploaded Artworks */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h2 className="h5 mb-0 d-flex align-items-center">
                <ListChecks size={20} className="me-2 text-info" /> Artes Enviadas
              </h2>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {Object.keys(artworksGroupedByClient).length === 0 ? (
                <p className="text-muted text-center">Nenhuma arte enviada ainda.</p>
              ) : (
                Object.entries(artworksGroupedByClient).map(([clientName, arts]) => (
                  <div key={clientName} className="mb-4">
                    <h3 className="h6 fw-medium border-bottom pb-2 mb-2 d-flex align-items-center">
                        <Building size={16} className="me-2 text-secondary"/> {clientName}
                    </h3>
                    <div className="list-group">
                      {arts.sort((a,b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime()).map(art => (
                        <div key={art.id} className="list-group-item list-group-item-action d-flex gap-3 p-2">
                          <Image
                            src={art.imageUrl}
                            alt={art.title}
                            width={80}
                            height={80}
                            className="img-thumbnail flex-shrink-0"
                            style={{ objectFit: 'cover' }}
                            data-ai-hint="design graphic"
                          />
                          <div className="flex-grow-1">
                            <h4 className="h6 mb-1 text-truncate">{art.title}</h4>
                            <p className="small text-muted mb-1">
                              Enviado em: {format(parseISO(art.uploadedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                            <span className={`badge small ${
                                art.status === 'approved' ? 'bg-success-subtle text-success-emphasis' :
                                art.status === 'changes_requested' ? 'bg-warning-subtle text-warning-emphasis' :
                                'bg-secondary-subtle text-secondary-emphasis'
                            }`}>
                              {art.status === 'pending' ? 'Pendente' : art.status === 'approved' ? 'Aprovado' : 'Alterações Solicitadas'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
