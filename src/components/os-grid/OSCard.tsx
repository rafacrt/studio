'use client';

import Link from 'next/link';
import type { OS } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Eye, CalendarClock, Flag, Copy, AlertTriangle, Edit3, CheckCircle2, Clock, Server, Users, FileText, User } from 'lucide-react'; // Added User icon here
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import { useToast } from '@/hooks/use-toast';

interface OSCardProps {
  os: OS;
}

const getStatusColorClass = (status: OSStatus, type: 'text' | 'bg' | 'border' = 'border') => {
  // These class names should match those in globals.css
  // Assuming enum values are like "Na Fila", "Aguardando Cliente", etc.
  // The CSS variables are named without spaces or special characters.
  // Example: OSStatus.AGUARDANDO_CLIENTE -> "status-aguardando-cliente"
  const statusSlug = status.toLowerCase().replace(/\s+/g, '-');
  switch (status) {
    case OSStatus.NA_FILA:
      return `${type}-muted-foreground`; // Or a specific color for "Na Fila"
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

const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.NA_FILA: return <Clock className="h-3 w-3 mr-1" />;
    case OSStatus.AGUARDANDO_CLIENTE: return <User className="h-3 w-3 mr-1" />; // User icon is now defined
    case OSStatus.EM_PRODUCAO: return <Server className="h-3 w-3 mr-1" />;
    case OSStatus.AGUARDANDO_PARCEIRO: return <Users className="h-3 w-3 mr-1" />;
    case OSStatus.FINALIZADO: return <CheckCircle2 className="h-3 w-3 mr-1" />;
    default: return <FileText className="h-3 w-3 mr-1" />;
  }
};


export default function OSCard({ os }: OSCardProps) {
  const { updateOSStatus, toggleUrgent, duplicateOS } = useOSStore();
  const { toast } = useToast();

  const cardClasses = cn(
    "shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col h-full",
    getStatusColorClass(os.status, 'border'),
    "border-l-4", 
    os.isUrgent && "urgent-highlight bg-red-500/5 dark:bg-red-500/10"
  );

  const handleStatusChange = (newStatus: string) => {
    updateOSStatus(os.id, newStatus as OSStatus);
    toast({
      title: 'Status Atualizado',
      description: `OS "${os.projeto}" movida para ${newStatus}.`,
    });
  };

  const handleToggleUrgent = () => {
    toggleUrgent(os.id);
    // Toast is handled in the store action
  };

  const handleDuplicateOS = () => {
    duplicateOS(os.id);
    // Toast is handled in the store action
  };
  
  return (
    <Card className={cardClasses}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="text-sm font-semibold leading-tight text-primary">
            OS: {os.numero}
          </CardTitle>
           {os.isUrgent && (
            <Badge variant="destructive" className="bg-status-urgente text-status-urgente text-xs h-5 px-1.5 py-0.5">
              <AlertTriangle className="h-2.5 w-2.5 mr-1"/> Urgente
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-baseline">
            <p className="text-base font-medium text-foreground truncate" title={os.cliente}>{os.cliente}</p>
            <p className="text-xs text-muted-foreground ml-2 truncate flex-shrink-0" title={os.projeto}>{os.projeto}</p>
        </div>
         {os.parceiro && (
          <CardDescription className="text-xs text-muted-foreground pt-0.5">
            Parceiro: {os.parceiro}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2 flex-grow">
        <div className="text-xs text-muted-foreground flex items-center mb-2">
          <CalendarClock className="h-3 w-3 mr-1.5" />
          Abertura: {format(parseISO(os.dataAbertura), "dd/MM/yy HH:mm", { locale: ptBR })}
        </div>
        
        <div className="mb-3">
            <Select value={os.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={cn("h-8 text-xs w-full", getStatusColorClass(os.status, 'text'), getStatusColorClass(os.status, 'border'))}>
                <div className="flex items-center">
                    {getStatusIcon(os.status)}
                    <SelectValue placeholder="Mudar status" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {ALL_OS_STATUSES.map(s => (
                <SelectItem key={s} value={s} className="text-xs">
                    <div className="flex items-center">
                        {getStatusIcon(s)}
                        {s}
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <p className="text-xs text-foreground line-clamp-2 mb-1" title={os.tarefa}>
          <strong>Tarefa:</strong> {os.tarefa}
        </p>
         {os.tempoTrabalhado && (
          <p className="text-xs text-muted-foreground line-clamp-1" title={os.tempoTrabalhado}>
            <strong>Tempo:</strong> {os.tempoTrabalhado}
          </p>
        )}


      </CardContent>
      <CardFooter className="p-3 border-t mt-auto">
        <div className="flex justify-between items-center w-full gap-2">
            <Button variant={os.isUrgent ? "destructive" : "outline"} size="sm" onClick={handleToggleUrgent} className="text-xs flex-1 h-7 px-2 py-1">
              <Flag className="h-3 w-3 mr-1" /> {os.isUrgent ? "Urgente!" : "Marcar Urgente"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicateOS} className="text-xs flex-1 h-7 px-2 py-1">
              <Copy className="h-3 w-3 mr-1" /> Duplicar
            </Button>
        </div>
      </CardFooter>
       <div className="p-3 border-t">
         <Link href={`/os/${os.id}`} prefetch={false} className="w-full">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 w-full text-xs h-7">
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver Detalhes
          </Button>
        </Link>
       </div>
    </Card>
  );
}
