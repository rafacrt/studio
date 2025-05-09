"use client";

import { useState, useEffect } from 'react';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserBookings } from '@/lib/mock-data';
import { BookingCard } from '@/components/BookingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadBookings = async () => {
        setIsLoading(true);
        try {
          const userBookings = await fetchUserBookings(user.id);
          setBookings(userBookings);
        } catch (error) {
          console.error("Falha ao buscar reservas:", error);
          // Handle error, e.g. show toast
        } finally {
          setIsLoading(false);
        }
      };
      loadBookings();
    }
  }, [user]);

  const activeBookings = bookings.filter(b => b.status === 'active');
  const pastBookings = bookings.filter(b => b.status === 'past' || b.status === 'cancelled');

  const renderBookingList = (list: Booking[], type: string) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
             <Card key={index} className="overflow-hidden rounded-xl">
                <div className="flex flex-col sm:flex-row">
                    <Skeleton className="sm:w-1/3 aspect-video sm:aspect-square" />
                    <div className="p-4 space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <div className="flex justify-end mt-2">
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>
            </Card>
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Nenhuma reserva {type === 'active' ? 'ativa' : 'anterior'} encontrada.</p>;
    }
    return (
      <div className="space-y-4">
        {list.map(booking => <BookingCard key={booking.id} booking={booking} />)}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Minhas Reservas</h1>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-lg p-1">
          <TabsTrigger value="active" className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md h-full">Ativas</TabsTrigger>
          <TabsTrigger value="past" className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md h-full">Anteriores</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderBookingList(activeBookings, 'active')}
        </TabsContent>
        <TabsContent value="past">
          {renderBookingList(pastBookings, 'past')}
        </TabsContent>
      </Tabs>
    </div>
  );
}

