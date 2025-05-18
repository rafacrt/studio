
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin, Bed, Bath, Wifi, Users, Tv, Utensils, Snowflake, ChevronRight, Loader2, School2 as DefaultUniversityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getRoomById, bookMockRoom } from '@/lib/mock-data';
import type { Listing, Amenity as AmenityType, UniversityArea, ListingImage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';


export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const id = typeof params.id === 'string' ? params.id : undefined;

  const [room, setRoom] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getRoomById(id)
        .then((data) => {
          if (data) {
            setRoom(data);
          } else {
            toast({ title: "Erro", description: "Quarto não encontrado.", variant: "destructive" });
            router.push('/explore');
          }
        })
        .catch(() => {
          toast({ title: "Erro", description: "Não foi possível carregar os detalhes do quarto.", variant: "destructive" });
          router.push('/explore');
        })
        .finally(() => setIsLoading(false));
    } else {
      toast({ title: "Erro", description: "ID do quarto inválido.", variant: "destructive" });
      router.push('/explore');
      setIsLoading(false);
    }
  }, [id, router, toast]);

  const handleBookRoom = async () => {
    if (!room || !user || !isAuthenticated) {
      toast({ title: "Atenção", description: "Você precisa estar logado para reservar.", variant: "default" });
      router.push(`/login?redirect=/room/${id}`);
      return;
    }
    setIsBooking(true);
    try {
      // Ensure checkOutDate is a valid future date or handle appropriately
      const checkInDate = new Date().toISOString().split('T')[0];
      const checkOutDateObj = new Date();
      checkOutDateObj.setMonth(checkOutDateObj.getMonth() + 1); // Example: 1 month later
      const checkOutDate = checkOutDateObj.toISOString().split('T')[0];

      await bookMockRoom(room.id, user.id, checkInDate, checkOutDate, 1);
      toast({
        title: "Reserva Solicitada!",
        description: `Sua solicitação para "${room.title}" foi enviada.`,
        variant: "default",
        className: "bg-accent text-accent-foreground",
      });
      // Update room availability locally if desired
      setRoom(prevRoom => prevRoom ? { ...prevRoom, isAvailable: false } : null);
    } catch (error: any) {
      toast({
        title: "Erro na Reserva",
        description: error.message || "Não foi possível realizar a reserva.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const nextImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + room.images.length) % room.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
        {/* Header Minimalista (Simulado com botão de voltar e Skeleton para título) */}
        <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 p-4 flex items-center border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        <Skeleton className="w-full aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1] md:rounded-b-lg" />
        <div className="p-4 md:p-6 space-y-4 w-full max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Separator />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
          <Separator />
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {/* Footer Action Skeleton */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 shadow-top-md z-20">
           <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-12 w-1/2 rounded-lg" />
           </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-background">
         <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 p-4 flex items-center border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Quarto Não Encontrado</h1>
        </div>
        <h1 className="text-2xl font-semibold mb-2 mt-16">Quarto não encontrado</h1>
        <p className="text-muted-foreground mb-4">O quarto que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/explore')} variant="outline">Voltar para Exploração</Button>
      </div>
    );
  }

  const UniversityIcon = room.university?.icon || DefaultUniversityIcon;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header é gerenciado pelo AuthenticatedLayout */}
      <main className="flex-grow pb-32 md:pb-10"> {/* Padding bottom for mobile action bar */}
        <div className="relative w-full aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1] group overflow-hidden md:rounded-b-lg">
          {room.images.length > 0 ? (
            <Image
              src={room.images[currentImageIndex]?.url || `https://placehold.co/1200x600.png?text=${encodeURIComponent(room.title)}`}
              alt={room.images[currentImageIndex]?.alt || room.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              data-ai-hint="apartment interior"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              <MapPin className="h-16 w-16" /> {/* Placeholder Icon */}
            </div>
          )}
          {room.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 shadow-md"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 shadow-md"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Badge
                variant="secondary"
                className="absolute bottom-3 right-3 z-10 bg-black/60 text-white px-2.5 py-1 text-xs rounded-full shadow-md"
              >
                {currentImageIndex + 1} / {room.images.length}
              </Badge>
            </>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
          <section>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
              {room.type} com Ar-condicionado e Wi-Fi – Próximo à {room.university.acronym}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Quarto em {room.university.city}, Brasil
            </p>
          </section>

          <Separator />

          <section className="text-sm text-foreground space-y-2.5">
            <div className="flex items-center space-x-3">
              <Bed className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{room.beds} cama(s) de solteiro</span>
            </div>
            <div className="flex items-center space-x-3">
              <Bath className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Banheiro {room.baths > 0 ? 'privativo' : 'compartilhado'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Acomoda {room.guests} pessoa(s)</span>
            </div>
            <div className="flex items-center space-x-3">
              <UniversityIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Próximo à {room.university.name} ({room.university.acronym})</span>
            </div>
          </section>

          {room.rating > 0 && (
            <>
              <Separator />
              <section className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-foreground">{room.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{room.reviews} avaliações</span>
              </section>
            </>
          )}
          
          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Descrição</h2>
            <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {room.description}
            </p>
          </section>

          {room.amenities.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">O que este lugar oferece</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {room.amenities.map((amenity: AmenityType) => (
                    <div key={amenity.id} className="flex items-center space-x-3 text-sm">
                      <amenity.icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Bottom action bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 shadow-top-lg z-20 md:hidden">
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-lg font-bold text-foreground whitespace-nowrap">
                    R$ {room.pricePerNight.toLocaleString('pt-BR')}
                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                </p>
            </div>
            <Button
              onClick={handleBookRoom}
              disabled={isBooking || !room.isAvailable}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md flex-grow max-w-[220px] text-base py-3"
            >
              {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (room.isAvailable ? 'Conferir disponibilidade' : 'Indisponível')}
            </Button>
        </div>
      </div>
      
      {/* Floating action card for desktop */}
      <div className="hidden md:block fixed bottom-6 right-6 z-20">
          <Card className="w-96 shadow-xl rounded-xl border">
              <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">
                      R$ {room.pricePerNight.toLocaleString('pt-BR')}
                      <span className="text-sm font-normal text-muted-foreground"> /mês</span>
                  </CardTitle>
                   <p className="text-xs text-muted-foreground">Preço final estimado. Confirme os detalhes.</p>
              </CardHeader>
              <CardContent className="pt-2">
                  {/* Future: Date Pickers and Guest Selector */}
                  {/* <div className="space-y-3 mb-4">
                       <Skeleton className="h-10 w-full rounded-md" />
                       <Skeleton className="h-10 w-full rounded-md" />
                  </div> */}
                  <Button
                      onClick={handleBookRoom}
                      disabled={isBooking || !room.isAvailable}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md py-3 text-base"
                  >
                      {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (room.isAvailable ? 'Conferir disponibilidade' : 'Indisponível')}
                  </Button>
                   {!room.isAvailable && (
                     <p className="text-xs text-destructive text-center mt-2">Este quarto não está disponível no momento.</p>
                   )}
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
