
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserBookings } from '@/lib/mock-data';
import type { Booking } from '@/types';
import { BookingCard } from '@/components/BookingCard';
import { Loader2, CalendarX2 } from 'lucide-react';
import { ExploreSearchBar } from '@/components/ExploreSearchBar';
import { CategoryMenu } from '@/components/CategoryMenu';
import { roomCategories } from '@/lib/mock-data'; // For CategoryMenu

export default function ReservationsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      fetchUserBookings(user.id)
        .then(data => {
          setBookings(data.sort((a, b) => new Date(b.bookedAt || 0).getTime() - new Date(a.bookedAt || 0).getTime()));
        })
        .catch(error => {
          console.error("Falha ao buscar reservas:", error);
          // Handle error (e.g., show toast)
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false); // No user, no bookings to load
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <ExploreSearchBar />
      <CategoryMenu categories={roomCategories} selectedCategory={null} />
      
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minhas Reservas</h1>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarX2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground">Você ainda não fez nenhuma reserva. Que tal explorar alguns quartos?</p>
            {/* TODO: Add a button to navigate to /explore */}
          </div>
        )}
      </div>
    </div>
  );
}
