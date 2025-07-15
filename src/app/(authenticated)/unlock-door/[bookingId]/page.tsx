
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/web/components/ui/button';
import { ArrowLeft, KeyRound, LockKeyhole, UnlockKeyhole, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/web/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/web/hooks/use-toast';
import { getRoomById } from '@/packages/lib/mock-data'; // Para buscar o título do quarto
import type { Booking } from '@/packages/types';


type UnlockState = 'idle' | 'unlocking' | 'unlocked' | 'error';

export default function UnlockDoorPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { toast } = useToast();

  const [unlockState, setUnlockState] = useState<UnlockState>('idle');
  const [roomTitle, setRoomTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);


  // Simulação de buscar o nome do quarto associado à reserva
  // Em um app real, você poderia buscar detalhes da reserva aqui se necessário.
  useEffect(() => {
    if (bookingId) {
        // Para este mock, vamos assumir que o bookingId pode ser parte de um ID de quarto ou um ID de reserva
        // e tentar buscar um quarto para exibir o título.
        // Esta lógica precisaria ser ajustada para o seu modelo de dados real.
        const fetchRoomTitle = async () => {
            setIsLoadingTitle(true);
            // Esta é uma simulação. Precisaríamos de uma forma de mapear bookingId para listingId
            // Para este exemplo, vamos usar o bookingId como se fosse um listingId (sabendo que é um mock)
            // Em um cenário real, você teria os dados da reserva, incluindo o listingId.
            // Por ora, vamos usar um ID de quarto fixo para o mock se o bookingId não for um ID de quarto válido.
            let mockListingId = bookingId;
            if (bookingId === "booking1" ) mockListingId = "quarto2"; // Exemplo de mapeamento
            if (bookingId === "booking3" ) mockListingId = "quarto1";


            try {
                const room = await getRoomById(mockListingId);
                if (room) {
                    setRoomTitle(room.title);
                } else {
                    setRoomTitle("Quarto Desconhecido");
                }
            } catch (error) {
                setRoomTitle("Detalhes Indisponíveis");
                console.error("Erro ao buscar detalhes do quarto:", error);
            } finally {
                setIsLoadingTitle(false);
            }
        };
        fetchRoomTitle();
    } else {
        setRoomTitle("ID da Reserva Inválido");
        setIsLoadingTitle(false);
    }
  }, [bookingId]);

  const handleUnlock = async () => {
    if (unlockState === 'unlocking' || unlockState === 'unlocked') return;

    setUnlockState('unlocking');
    // Simula chamada à API
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simula sucesso ou falha aleatoriamente
    const success = Math.random() > 0.2; // 80% de chance de sucesso

    if (success) {
      setUnlockState('unlocked');
      toast({
        title: "Porta Destrancada!",
        description: "Acesso liberado.",
        variant: "default",
        className: "bg-green-500 text-white"
      });
    } else {
      setUnlockState('error');
      toast({
        title: "Falha ao Destrancar",
        description: "Não foi possível abrir a porta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getButtonContent = () => {
    switch (unlockState) {
      case 'idle':
        return (
          <>
            <LockKeyhole className="h-12 w-12 md:h-16 md:w-16 mb-4 text-primary" />
            <span className="text-xl md:text-2xl font-semibold">Toque para Destrancar</span>
          </>
        );
      case 'unlocking':
        return (
          <>
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin mb-4 text-primary" />
            <span className="text-xl md:text-2xl font-semibold">Destrancando...</span>
          </>
        );
      case 'unlocked':
        return (
          <>
            <UnlockKeyhole className="h-12 w-12 md:h-16 md:w-16 mb-4 text-green-500" />
            <span className="text-xl md:text-2xl font-semibold text-green-500">Porta Destrancada!</span>
            <p className="text-sm text-muted-foreground mt-2">Acesso liberado.</p>
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="h-12 w-12 md:h-16 md:w-16 mb-4 text-destructive" />
            <span className="text-xl md:text-2xl font-semibold text-destructive">Falha ao Destrancar</span>
            <p className="text-sm text-muted-foreground mt-2">Tente novamente.</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-2xl mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center">
          Destrancar Porta
        </h1>
        {isLoadingTitle ? (
             <div className="h-6 bg-muted rounded w-3/4 mx-auto mt-2 animate-pulse"></div>
        ) : (
            <p className="text-center text-muted-foreground mt-2 text-lg">{roomTitle || `Reserva ID: ${bookingId}`}</p>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full">
        <Card className={cn(
            "w-full max-w-md shadow-2xl rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105",
            unlockState === 'unlocked' ? 'border-green-500 ring-2 ring-green-500' : '',
            unlockState === 'error' ? 'border-destructive ring-2 ring-destructive' : '',
            unlockState === 'unlocking' ? 'opacity-80' : ''
        )} onClick={handleUnlock} >
          <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center aspect-square">
            {getButtonContent()}
          </CardContent>
        </Card>

        {unlockState === 'unlocked' && (
          <Button onClick={() => router.back()} className="mt-8 bg-green-500 hover:bg-green-600 text-primary-foreground">
            <CheckCircle className="mr-2 h-5 w-5" />
            Concluído
          </Button>
        )}
        {unlockState === 'error' && (
          <Button onClick={handleUnlock} className="mt-8" variant="outline">
            Tentar Novamente
          </Button>
        )}
      </main>
    </div>
  );
}
