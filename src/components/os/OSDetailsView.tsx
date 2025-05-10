'use client';

import type { OS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, FileText, Flag, Server, User, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { OSStatus } from '@/lib/types'; // Import OSStatus

const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.AGUARDANDO_CLIENTE: return <Clock className="h-4 w-4 mr-2" />;
    case OSStatus.EM_PRODUCAO: return <Server className="h-4 w-4 mr-2" />;
    case OSStatus.AGUARDANDO_PARCEIRO: return <Users className="h-4 w-4 mr-2" />;
    case OSStatus.FINALIZADO: return <CheckCircle2 className="h-4 w-4 mr-2" />;
    default: return <FileText className="h-4 w-4 mr-2" />;
  }
};

const getStatusColorClass = (status: OSStatus) => {
  switch (status) {
    case OSStatus.AGUARDANDO_CLIENTE: return 'text-status-aguardando-cliente border-status-aguardando-cliente';
    case OSStatus.EM_PRODUCAO: return 'text-status-em-producao border-status-em-producao';
    case OSStatus.AGUARDANDO_PARCEIRO: return 'text-status-aguardando-parceiro border-status-aguardando-parceiro';
    case OSStatus.FINALIZADO: return 'text-status-finalizado border-status-finalizado';
    default: return 'text-muted-foreground border-muted-foreground';
  }
};


interface OSDetailsViewProps {
  os: OS;
}

export default function OSDetailsView({ os }: OSDetailsViewProps) {
  const DetailItem = ({ label, value, icon, className }: { label: string; value?: string | null; icon?: React.ReactNode, className?: string }) => (
    <div className={cn("py-3 sm:grid sm:grid-cols-3 sm:gap-4", className)}>
      <dt className="text-sm font-medium text-muted-foreground flex items-center">{icon}{label}</dt>
      <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 break-words">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{os.projeto}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Order of Service: {os.numero}
              </CardDescription>
            </div>
            {os.isUrgent && (
              <Badge variant="destructive" className="bg-status-urgente text-status-urgente text-base px-3 py-1">
                <Flag className="h-4 w-4 mr-1.5" /> URGENT
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="divide-y divide-border">
            <DetailItem label="Client" value={os.cliente} icon={<User className="h-4 w-4 mr-2 text-primary" />} />
            {os.parceiro && <DetailItem label="Partner" value={os.parceiro} icon={<Users className="h-4 w-4 mr-2 text-primary" />} />}
            <DetailItem label="Status" icon={getStatusIcon(os.status)} value={
              <Badge variant="outline" className={cn("text-sm", getStatusColorClass(os.status))}>
                {os.status}
              </Badge>
            } />
            <DetailItem label="Date Opened" value={format(parseISO(os.dataAbertura), "PPP p")} icon={<CalendarClock className="h-4 w-4 mr-2 text-primary" />} />
            {os.dataFinalizacao && (
              <DetailItem label="Date Finalized" value={format(parseISO(os.dataFinalizacao), "PPP p")} icon={<CheckCircle2 className="h-4 w-4 mr-2 text-status-finalizado" />} />
            )}
             <div className="py-3">
              <dt className="text-sm font-medium text-muted-foreground flex items-center"><FileText className="h-4 w-4 mr-2 text-primary" />Observations</dt>
              <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-md">{os.observacoes || 'No observations provided.'}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter>
          {/* Actions like Edit/Delete could go here in a non-minimal version */}
        </CardFooter>
      </Card>
    </div>
  );
}
