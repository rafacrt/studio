
'use client';

import { useEffect, useState } from 'react';
// type { OS } from '@/lib/types'; // Type is used in OSCard, not directly here anymore
import { useOSStore } from '@/store/os-store';
import OSCard from './OSCard';
import { CreateOSDialog } from '@/components/os/CreateOSDialog'; // Keep dialog trigger
// import { Loader2 } from 'lucide-react'; // Use Bootstrap spinner

export default function OSGrid() {
  const osList = useOSStore((state) => state.osList);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="d-flex flex-column h-100">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h1 className="h3 mb-0">Ordens de Serviço</h1>
          {/* Placeholder for button to prevent layout shift */}
          <div className="placeholder-glow">
            <span className="placeholder col-4" style={{ height: '38px', width: '120px' }}></span>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center flex-grow-1 text-muted">
           <div className="spinner-border text-primary me-2" role="status">
             <span className="visually-hidden">Carregando...</span>
           </div>
          Carregando quadro...
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0">Ordens de Serviço</h1>
        <CreateOSDialog /> {/* Trigger remains */}
      </div>
      {osList.length === 0 ? (
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <p className="fs-5 text-muted">Nenhuma Ordem de Serviço encontrada. Crie uma nova!</p>
        </div>
      ) : (
         // Use Bootstrap grid: row > col-*
         <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 pb-4 flex-grow-1">
          {osList.map((os) => (
            <div className="col" key={os.id}> {/* Each card in a Bootstrap column */}
              <OSCard os={os} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
