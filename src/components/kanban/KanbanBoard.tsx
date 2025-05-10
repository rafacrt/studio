'use client';

import { useEffect, useState } from 'react';
import type { OS } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';
import { useOSStore } from '@/store/os-store';
import KanbanColumn from './KanbanColumn';
import { CreateOSDialog } from '@/components/os/CreateOSDialog';
import { useToast } from '@/hooks/use-toast';

export default function KanbanBoard() {
  const { osList, updateOSStatus } = useOSStore((state) => ({
    osList: state.osList,
    updateOSStatus: state.updateOSStatus,
  }));
  const { toast } = useToast();

  // Zustand hydration can cause mismatch if not handled.
  // This ensures we only render the board once the store is synced with localStorage.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);


  const handleDragStartCard = (e: React.DragEvent<HTMLDivElement>, osId: string) => {
    e.dataTransfer.setData('text/plain', osId);
  };

  const handleDropCard = (e: React.DragEvent<HTMLDivElement>, targetStatus: OSStatus) => {
    e.preventDefault();
    const osId = e.dataTransfer.getData('text/plain');
    if (osId) {
      const draggedOS = osList.find(os => os.id === osId);
      if (draggedOS && draggedOS.status !== targetStatus) {
        updateOSStatus(osId, targetStatus);
        toast({
          title: 'OS Updated',
          description: `Moved "${draggedOS.projeto}" to ${targetStatus}.`,
        });
      }
    }
  };

  if (!isHydrated) {
    // Or a more sophisticated skeleton loader
    return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading board...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        <CreateOSDialog />
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 flex-grow">
        {ALL_OS_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            osItems={osList.filter((os) => os.status === status)}
            onDragStartCard={handleDragStartCard}
            onDropCard={handleDropCard}
          />
        ))}
      </div>
    </div>
  );
}
