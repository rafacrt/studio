"use client";

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound, ScanLine, XCircle, LockOpen } from 'lucide-react'; // Removed CheckCircle as LockOpen is used for success
import { triggerHapticFeedback } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type AccessStatus = 'idle' | 'scanning' | 'unlocking' | 'unlocked' | 'failed';

function AccessPageContent() {
  const [status, setStatus] = useState<AccessStatus>('idle');
  const [countdown, setCountdown] = useState(3);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const { toast } = useToast();


  useEffect(() => {
    if (!listingId) {
      toast({ title: "Acesso Negado", description: "Nenhum quarto especificado para acesso.", variant: "destructive"});
      setStatus('failed');
    }
  }, [listingId, toast]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'unlocking' && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (status === 'unlocking' && countdown === 0) {
      setStatus('unlocked');
      triggerHapticFeedback([100, 50, 100]); 
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handleAccessAttempt = () => {
    if (!listingId) {
      toast({ title: "Erro", description: "Não é possível iniciar o acesso sem um ID de quarto.", variant: "destructive"});
      return;
    }
    triggerHapticFeedback(50); 
    setStatus('scanning');
    setTimeout(() => {
      setStatus('unlocking');
      setCountdown(3);
    }, 2000); 
  };

  const getStatusContent = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <KeyRound size={64} className="text-primary" />,
          text: 'Pronto para Desbloquear',
          buttonText: 'Pressione para Desbloquear',
          buttonDisabled: !listingId,
        };
      case 'scanning':
        return {
          icon: <ScanLine size={64} className="text-primary animate-pulse" />,
          text: 'Escaneando...',
          buttonText: 'Escaneando...',
          buttonDisabled: true,
        };
      case 'unlocking':
        return {
          icon: <Loader2 size={64} className="text-primary animate-spin" />,
          text: `Desbloqueando... ${countdown}`,
          buttonText: `Desbloqueando... ${countdown}`,
          buttonDisabled: true,
        };
      case 'unlocked':
        return {
          icon: <LockOpen size={64} className="text-accent" />,
          text: 'Porta Desbloqueada!',
          buttonText: 'Desbloqueada',
          buttonDisabled: true,
        };
      case 'failed':
        return {
          icon: <XCircle size={64} className="text-destructive" />,
          text: 'Falha no Acesso',
          buttonText: 'Tentar Novamente',
          buttonDisabled: !listingId,
        };
      default:
        return {
          icon: <KeyRound size={64} className="text-primary" />,
          text: 'Pronto',
          buttonText: 'Desbloquear',
          buttonDisabled: !listingId,
        };
    }
  };

  const { icon, text, buttonText, buttonDisabled } = getStatusContent();

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <div className="mb-12">
        {icon}
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-6">{text}</h1>
      
      <p className="text-muted-foreground mb-10 max-w-md">
        {status === 'idle' && `Pressione o botão abaixo para simular o desbloqueio da porta para sua reserva${listingId ? ` no quarto ${listingId}`: ''}.`}
        {status === 'scanning' && 'Mantenha seu dispositivo próximo à porta. Estamos tentando conectar com segurança.'}
        {status === 'unlocking' && 'Conexão estabelecida. Verificando acesso e desbloqueando a porta.'}
        {status === 'unlocked' && `Bem-vindo(a)! A porta está agora desbloqueada. Por favor, entre.`}
        {status === 'failed' && 'Não foi possível completar a solicitação de acesso. Verifique sua conexão ou detalhes da reserva e tente novamente.'}
      </p>

      <Button
        size="lg"
        className={cn(
          "rounded-full h-24 w-24 sm:h-32 sm:w-32 text-lg font-semibold p-0 shadow-xl transition-all duration-300",
          status === 'idle' && 'bg-primary hover:bg-primary/90 text-primary-foreground',
          status === 'scanning' && 'bg-blue-500 text-white cursor-not-allowed', // Keeping specific colors for states as per original
          status === 'unlocking' && 'bg-yellow-500 text-white cursor-not-allowed', // Keeping specific colors for states as per original
          status === 'unlocked' && 'bg-accent hover:bg-accent/90 text-accent-foreground cursor-not-allowed',
          status === 'failed' && 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
        )}
        onClick={status === 'failed' || status === 'idle' ? handleAccessAttempt : undefined}
        disabled={buttonDisabled}
        aria-live="polite"
      >
         {status === 'idle' && <KeyRound size={36} />}
         {status === 'scanning' && <ScanLine size={36} />}
         {status === 'unlocking' && <Loader2 size={36} className="animate-spin" />}
         {status === 'unlocked' && <LockOpen size={36} />}
         {status === 'failed' && <XCircle size={36} />}
      </Button>
      <p className="sr-only">{buttonText}</p>

      {listingId && status !== 'failed' &&
        <p className="text-xs text-muted-foreground mt-8">Acessando Quarto ID: {listingId}</p>
      }
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <AccessPageContent />
    </Suspense>
  );
}

