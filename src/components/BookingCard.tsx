
"use client";

import type { Booking } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UnlockDoorAnimation } from '@/components/UnlockDoorAnimation';
import { useState } from 'react';
import { CalendarDays, MapPin, Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);

  const handleUnlockDoor = async () => {
    if (isUnlocked || isUnlocking) return;

    setIsUnlocking(true);
    setShowUnlockMessage(false); // Reset message

    // Simulate unlock process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUnlocking(false);
    setIsUnlocked(true);
    setShowUnlockMessage(true);

    // Hide message after a few seconds
    setTimeout(() => setShowUnlockMessage(false), 3000);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
    } catch (e) {
      return dateString; // fallback
    }
  };
  
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmada':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Confirmada</Badge>;
      case 'Pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400"><AlertTriangle className="mr-1 h-3 w-3" />Pendente</Badge>;
      case 'Cancelada':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelada</Badge>;
      case 'Concluída':
        return <Badge variant="default">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };


  const listingImage = booking.listing.images[0]?.url || 'https://placehold.co/400x300.png?text=Quarto';
  const listingImageAlt = booking.listing.images[0]?.alt || booking.listing.title;

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <Image
            src={listingImage}
            alt={listingImageAlt}
            width={400}
            height={300}
            className="object-cover w-full h-48 md:h-full"
            data-ai-hint="booked room exterior"
          />
        </div>
        <div className="md:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold text-foreground mb-1 leading-tight">
                {booking.listing.title}
                </CardTitle>
                {getStatusBadge(booking.status)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1.5" /> {booking.listing.university.name} - {booking.listing.university.city}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              <span>Check-in: {formatDate(booking.checkInDate)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              <span>Check-out: {formatDate(booking.checkOutDate)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>{booking.guests} Hóspede(s)</span>
            </div>
            <Separator className="my-3"/>
             <p className="text-xs text-muted-foreground">
                Reservado em: {booking.bookedAt ? formatDate(booking.bookedAt) : 'Data indisponível'}
            </p>
             <p className="text-lg font-semibold text-foreground">
                Total: R$ {booking.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
          {booking.status === 'Confirmada' && (
            <CardFooter className="pt-0">
              <div className="flex flex-col items-center w-full">
                <Button 
                  onClick={handleUnlockDoor} 
                  disabled={isUnlocking || isUnlocked}
                  className="w-full max-w-xs bg-[hsl(var(--airbnb-primary))] hover:bg-[hsl(var(--airbnb-primary))] text-[hsl(var(--airbnb-primary-foreground))] font-semibold shadow-md"
                  style={{ backgroundColor: "hsl(var(--airbnb-primary))", color: "hsl(var(--airbnb-primary-foreground))"}}
                >
                  <UnlockDoorAnimation isUnlocking={isUnlocking} isUnlocked={isUnlocked} />
                </Button>
                {showUnlockMessage && isUnlocked && (
                  <p className="text-sm text-green-600 mt-2">Porta destrancada com sucesso!</p>
                )}
                 {isUnlocking && (
                  <p className="text-sm text-muted-foreground mt-2">Aguarde, destrancando...</p>
                )}
              </div>
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
}
```