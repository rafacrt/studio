'use client';

import type { OS } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import KanbanCard from './KanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: OSStatus;
  osItems: OS[];
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, osId: string) => void;
  onDropCard: (e: React.DragEvent<HTMLDivElement>, targetStatus: OSStatus) => void;
}

const getStatusColorClass = (status: OSStatus, type: 'text' | 'bg' | 'border' = 'border') => {
  switch (status) {
    case OSStatus.AGUARDANDO_CLIENTE:
      return `${type}-status-aguardando-cliente`;
    case OSStatus.EM_PRODUCAO:
      return `${type}-status-em-producao`;
    case OSStatus.AGUARDANDO_PARCEIRO:
      return `${type}-status-aguardando-parceiro`;
    case OSStatus.FINALIZADO:
      return `${type}-status-finalizado`;
    default:
      return `${type}-muted`;
  }
};

export default function KanbanColumn({ status, osItems, onDragStartCard, onDropCard }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    onDropCard(e, status);
  };

  const headerBgClass = getStatusColorClass(status, 'bg');
  const headerTextClass = status === OSStatus.FINALIZADO || status === OSStatus.AGUARDANDO_PARCEIRO ? 'text-primary-foreground' : 'text-foreground';
  
  return (
    <div
      className="flex-1 min-w-[300px] max-w-[380px] bg-muted/50 rounded-lg shadow-md"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={cn("p-4 rounded-t-lg sticky top-0 z-10", headerBgClass)}>
        <h3 className={cn("text-lg font-semibold", headerTextClass)}>
          {status} ({osItems.length})
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-220px)] p-4"> {/* Adjust height as needed */}
        {osItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No tasks in this stage.</p>
        ) : (
          osItems.map((os) => (
            <KanbanCard key={os.id} os={os} onDragStart={onDragStartCard} />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
