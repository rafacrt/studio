'use client';

import Link from 'next/link';
import type { OS } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn }
from '@/lib/utils';
import { Eye, CalendarDays, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface KanbanCardProps {
  os: OS;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, osId: string) => void;
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
      return `${type}-muted-foreground`;
  }
};


export default function KanbanCard({ os, onDragStart }: KanbanCardProps) {
  const cardClasses = cn(
    "mb-4 cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-shadow duration-200",
    getStatusColorClass(os.status, 'border'),
    "border-l-4", // Add a thicker left border with status color
    os.isUrgent && "urgent-highlight bg-red-500/5 dark:bg-red-500/10" // Special highlight for urgent tasks
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e, os.id);
  };
  
  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cardClasses}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight">
            <Link href={`/os/${os.id}`} className="hover:underline" prefetch={false}>
              {os.projeto}
            </Link>
          </CardTitle>
          {os.isUrgent && (
            <Badge variant="destructive" className="bg-status-urgente text-status-urgente text-xs h-6">
              <Flag className="h-3 w-3 mr-1"/> Urgent
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground pt-1">{os.cliente}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-foreground line-clamp-3 mb-2">
          {os.observacoes}
        </p>
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          Opened: {format(parseISO(os.dataAbertura), "MMM d, yyyy")}
        </div>
         <Badge variant="outline" className={cn("mt-2 text-xs", getStatusColorClass(os.status, 'text'), getStatusColorClass(os.status, 'border'))}>
          {os.status}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
         <span className="text-xs font-mono text-muted-foreground">{os.numero}</span>
        <Link href={`/os/${os.id}`} prefetch={false}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Eye className="h-4 w-4 mr-1.5" /> View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
