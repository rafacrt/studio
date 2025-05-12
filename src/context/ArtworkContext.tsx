
'use client';

import type { Artwork } from '@/lib/types';
import React, { createContext, useState, useContext, type ReactNode, useMemo, useCallback } from 'react';

// Mock client data for admin panel selection (can be expanded or fetched in a real app)
export const mockWorkflowClients = [
    { id: 'client-mock-id-1', name: 'Cliente Exemplo 1' },
    { id: 'client-mock-id-2', name: 'Cliente Exemplo 2' },
    { id: 'client-mock-id-3', name: 'Empresa Inovadora S.A.'},
];

const initialContextArtworks: Artwork[] = [
  { id: 'art-ctx-1', clientId: 'client-mock-id-1', clientName: 'Cliente Exemplo 1', title: 'Banner Principal Website (Cliente 1)', imageUrl: 'https://picsum.photos/seed/ctxbanner1/600/300', status: 'pending', feedback: '', showFeedbackInput: false, uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'art-ctx-2', clientId: 'client-mock-id-1', clientName: 'Cliente Exemplo 1', title: 'Post Instagram - Promoção (Cliente 1)', imageUrl: 'https://picsum.photos/seed/ctxinsta1/400/400', status: 'pending', feedback: '', showFeedbackInput: false, uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'art-ctx-3', clientId: 'client-mock-id-2', clientName: 'Cliente Exemplo 2', title: 'Ícone App Mobile (Cliente 2)', imageUrl: 'https://picsum.photos/seed/ctxicon1/200/200', status: 'pending', feedback: '', showFeedbackInput: false, uploadedAt: new Date().toISOString() },
  { id: 'art-ctx-4', clientId: 'client-mock-id-1', clientName: 'Cliente Exemplo 1', title: 'Anúncio Revista (Cliente 1)', imageUrl: 'https://picsum.photos/seed/ctxrevista1/500/400', status: 'changes_requested', feedback: 'Ajustar cores e aumentar o logo.', showFeedbackInput: false, uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()},
];


interface ArtworkContextType {
  artworks: Artwork[];
  addArtwork: (artworkData: { clientId: string; clientName?: string; title: string; imageUrl: string; uploadedAt: string }) => void;
  updateArtwork: (updatedArtwork: Artwork) => void;
  getArtworksByClientId: (clientId: string) => Artwork[];
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
     // Load artworks from localStorage or use initial if not found
     if (typeof window !== 'undefined') {
        const savedArtworks = localStorage.getItem('workflowArtworks');
        return savedArtworks ? JSON.parse(savedArtworks) : initialContextArtworks;
     }
     return initialContextArtworks;
  });

  // Save artworks to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('workflowArtworks', JSON.stringify(artworks));
    }
  }, [artworks]);


  const addArtwork = useCallback((artworkData: { clientId: string; clientName?: string; title: string; imageUrl: string; uploadedAt: string }) => {
    setArtworks(prev => [...prev, {
      ...artworkData,
      id: `art-ctx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // More unique ID
      status: 'pending',
      feedback: '',
      showFeedbackInput: false,
    }]);
  }, []);

  const updateArtwork = useCallback((updatedArtwork: Artwork) => {
    setArtworks(prev => prev.map(art =>
      art.id === updatedArtwork.id ? updatedArtwork : art
    ));
  }, []);

  const getArtworksByClientId = useCallback((clientId: string) => {
    return artworks.filter(art => art.clientId === clientId);
  }, [artworks]);

  const contextValue = useMemo(() => ({
    artworks,
    addArtwork,
    updateArtwork,
    getArtworksByClientId
  }), [artworks, addArtwork, updateArtwork, getArtworksByClientId]);

  return (
    <ArtworkContext.Provider value={contextValue}>
      {children}
    </ArtworkContext.Provider>
  );
};

export const useArtworkContext = () => {
  const context = useContext(ArtworkContext);
  if (!context) {
    throw new Error('useArtworkContext must be used within an ArtworkProvider');
  }
  return context;
};
