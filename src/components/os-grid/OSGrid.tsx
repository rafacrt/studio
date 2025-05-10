'use client';

import { useEffect, useState } from 'react';
import type { OS } from '@/lib/types';
import { useOSStore } from '@/store/os-store';
import OSCard from './OSCard';
import { CreateOSDialog } from '@/components/os/CreateOSDialog';
import { Loader2 } from 'lucide-react';

export default function OSGrid() {
  const osList = useOSStore((state) => state.osList);
  
  // Zustand hydration can cause mismatch if not handled.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          {/* Placeholder for button to prevent layout shift */}
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Carregando quadro...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
        <CreateOSDialog />
      </div>
      {osList.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Nenhuma Ordem de Serviço encontrada. Crie uma nova!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 flex-grow">
          {osList.map((os) => (
            <OSCard key={os.id} os={os} />
          ))}
        </div>
      )}
    </div>
  );
}
