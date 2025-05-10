'use client';

import type { OS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User, Users, Briefcase, Edit3, MessageSquare, Clock3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { OSStatus } from '@/lib/types'; 

const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.NA_FILA: return <Clock className="h-4 w-4 mr-2" />;
    case OSStatus.AGUARDANDO_CLIENTE: return <User className="h-4 w-4 mr-2" />;
    case OSStatus.EM_PRODUCAO: return <Server className="h-4 w-4 mr-2" />;
    case OSStatus.AGUARDANDO_PARCEIRO: return <Users className="h-4 w-4 mr-2" />;
    case OSStatus.FINALIZADO: return <CheckCircle2 className="h-4 w-4 mr-2" />;
    default: return <FileText className="h-4 w-4 mr-2" />;
  }
};

const getStatusColorClass = (status: OSStatus) => {
  // These class names should match those in globals.css
  const statusSlug = status.toLowerCase().replace(/\s+/g, '-');
   switch (status) {
    case OSStatus.NA_FILA:
      return 'text-muted-foreground border-muted-foreground';
    case OSStatus.AGUARDANDO_CLIENTE:
      return 'text-status-aguardando-cliente border-status-aguardando-cliente';
    case OSStatus.EM_PRODUCAO:
      return 'text-status-em-producao border-status-em-producao';
    case OSStatus.AGUARDANDO_PARCEIRO:
      return 'text-status-aguardando-parceiro border-status-aguardando-parceiro';
    case OSStatus.FINALIZADO:
      return 'text-status-finalizado border-status-finalizado';
    default:
      return 'text-muted-foreground border-muted-foreground';
  }
};


interface OSDetailsViewProps {
  os: OS;
}

export default function OSDetailsView({ os }: OSDetailsViewProps) {
  const DetailItem = ({ label, value, icon, className, isHtml = false }: { label: string; value?: string | null | React.ReactNode; icon?: React.ReactNode, className?: string, isHtml?: boolean }) => (
    <div className={cn("py-3 sm:grid sm:grid-cols-3 sm:gap-4", className)}>
      <dt className="text-sm font-medium text-muted-foreground flex items-center">{icon}{label}</dt>
      {isHtml && typeof value === 'string' ? (
        <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 break-words" dangerouslySetInnerHTML={{ __html: value || 'N/A' }} />
      ) : (
        <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 break-words">{value || 'N/A'}</dd>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{os.projeto}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Ordem de Serviço: {os.numero}
              </CardDescription>
            </div>
            {os.isUrgent && (
              <Badge variant="destructive" className="bg-status-urgente text-status-urgente text-base px-3 py-1">
                <Flag className="h-4 w-4 mr-1.5" /> URGENTE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="divide-y divide-border">
            <DetailItem label="Cliente" value={os.cliente} icon={<User className="h-4 w-4 mr-2 text-primary" />} />
            {os.parceiro && <DetailItem label="Parceiro" value={os.parceiro} icon={<Users className="h-4 w-4 mr-2 text-primary" />} />}
            <DetailItem label="Status" icon={getStatusIcon(os.status)} value={
              <Badge variant="outline" className={cn("text-sm", getStatusColorClass(os.status))}>
                {getStatusIcon(os.status)} {os.status}
              </Badge>
            } />
            <DetailItem label="Data de Abertura" value={format(parseISO(os.dataAbertura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CalendarClock className="h-4 w-4 mr-2 text-primary" />} />
            {os.dataFinalizacao && (
              <DetailItem label="Data de Finalização" value={format(parseISO(os.dataFinalizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} icon={<CheckCircle2 className="h-4 w-4 mr-2 text-status-finalizado" />} />
            )}
             <div className="py-3">
              <dt className="text-sm font-medium text-muted-foreground flex items-center"><Briefcase className="h-4 w-4 mr-2 text-primary" />Tarefa Principal</dt>
              <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-md">{os.tarefa || 'Nenhuma tarefa principal fornecida.'}</dd>
            </div>
             <div className="py-3">
              <dt className="text-sm font-medium text-muted-foreground flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-primary" />Observações</dt>
              <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-md">{os.observacoes || 'Nenhuma observação fornecida.'}</dd>
            </div>
            {os.tempoTrabalhado && (
               <div className="py-3">
                <dt className="text-sm font-medium text-muted-foreground flex items-center"><Clock3 className="h-4 w-4 mr-2 text-primary" />Tempo Trabalhado</dt>
                <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-md">{os.tempoTrabalhado}</dd>
              </div>
            )}
          </dl>
        </CardContent>
        <CardFooter>
          {/* Ações como Editar/Deletar poderiam ir aqui */}
        </CardFooter>
      </Card>
    </div>
  );
}
