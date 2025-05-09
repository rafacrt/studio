"use client";

import type { Booking } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface BookingCardProps {
  booking: Booking;
}

const statusColors: Record<Booking['status'], string> = {
  active: 'bg-green-500 text-green-50',
  past: 'bg-gray-500 text-gray-50',
  cancelled: 'bg-red-500 text-red-50',
};

const statusDisplay: Record<Booking['status'], string> = {
  active: 'Ativa',
  past: 'Anterior',
  cancelled: 'Cancelada',
};

export function BookingCard({ booking }: BookingCardProps) {
  const formattedStartDate = format(parseISO(booking.startDate), "dd/MM/yyyy", { locale: ptBR });
  const formattedEndDate = format(parseISO(booking.endDate), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Card className="overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 aspect-video sm:aspect-square relative overflow-hidden">
          <Image
            src={booking.listingImage}
            alt={booking.listingTitle}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="student room exterior"
          />
        </div>
        <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                <Link href={`/room/${booking.listingId}`} onClick={() => triggerHapticFeedback(5)}>
                  {booking.listingTitle}
                </Link>
              </h3>
              <Badge variant="outline" className={`capitalize text-xs ${statusColors[booking.status]}`}>
                {statusDisplay[booking.status]}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center">
              <CalendarDays size={14} className="mr-1.5" />
              <span>{formattedStartDate} - {formattedEndDate}</span>
            </div>
            <p className="text-sm text-foreground mt-1">Total: R$ {booking.totalPrice.toFixed(2)}</p>
          </div>

          <div className="mt-3 flex justify-end">
            {booking.status === 'active' && (
              <Link href={`/access?listingId=${booking.listingId}`} passHref>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => triggerHapticFeedback()}
                >
                  Acessar Quarto
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </Link>
            )}
             {booking.status === 'past' && (
              <Link href={`/room/${booking.listingId}`} passHref>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => triggerHapticFeedback()}
                >
                  Ver Quarto
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

