
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Star, Bed, Bath, Users, Tv, Utensils, Snowflake, ChevronRight, Loader2, School2 as DefaultUniversityIcon, Share2, Heart, StarHalf, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      const checkInDate = new Date().toISOString().split('T')[0];
      const checkOutDateObj = new Date();
      checkOutDateObj.setMonth(checkOutDateObj.getMonth() + 1);
      const checkOutDate = checkOutDateObj.toISOString().split('T')[0];

      await bookMockRoom(room.id, user.id, checkInDate, checkOutDate, 1);
      toast({
        title: "Reserva Solicitada!",
        description: `Sua solicitação para "${room.title}" foi enviada.`,
        variant: "default",
        className: "bg-accent text-accent-foreground",
      });
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

  const handleFavorite = () => {
    toast({ title: "Favoritos", description: "Funcionalidade de favoritar em desenvolvimento." });
  };

  const handleShare = () => {
    if (navigator.share && room) {
      navigator.share({
        title: room.title,
        text: `Confira este quarto: ${room.title}`,
        url: window.location.href,
      }).catch(error => console.log('Erro ao compartilhar', error));
    } else {
      toast({ title: "Compartilhar", description: "Navegador não suporta compartilhamento ou quarto não carregado." });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const totalStars = 5;
    for (let i = 1; i <= totalStars; i++) {
      if (i <= rating) {
        stars.push(<Star key={`star-full-${i}`} className="h-3 w-3 text-foreground fill-foreground" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={`star-half-${i}`} className="h-3 w-3 text-foreground fill-foreground" />);
      } else {
        stars.push(<Star key={`star-empty-${i}`} className="h-3 w-3 text-foreground fill-none stroke-current" />);
      }
    }
    return stars;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
        <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 p-3 flex items-center justify-between border-b h-14">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-6 w-1/3" />
           <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        <div className="w-full mt-14"> {/* Adjusted for fixed header */}
          <Skeleton className="w-full aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1] rounded-b-lg" />
          <div className="bg-background rounded-t-3xl p-5 md:p-8 space-y-4 w-full max-w-4xl mx-auto -mt-6 md:-mt-8 relative z-10 shadow-xl">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Separator />
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
               <div className="flex items-center justify-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
               <div className="flex items-center justify-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Separator />
            <Skeleton className="h-6 w-1/4 mb-2 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 shadow-top-md z-20 md:hidden">
           <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-12 w-1/2 rounded-lg" />
           </div>
        </div>
         <div className="hidden md:block fixed bottom-6 right-6 z-20">
            <Card className="w-96 shadow-xl rounded-xl border">
                <CardHeader className="pb-4"> <Skeleton className="h-8 w-1/2" /> <Skeleton className="h-4 w-3/4 mt-1" /> </CardHeader>
                <CardContent className="pt-2"> <Skeleton className="h-12 w-full rounded-lg" /> </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-background">
         <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 p-3 flex items-center justify-between border-b h-14">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">Quarto Não Encontrado</h1>
             <div className="w-16"></div> {/* Spacer */}
        </header>
        <div className="mt-14"> {/* Adjusted for fixed header */}
            <h1 className="text-2xl font-semibold mb-2">Quarto não encontrado</h1>
            <p className="text-muted-foreground mb-4">O quarto que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => router.push('/explore')} variant="outline">Voltar para Exploração</Button>
        </div>
      </div>
    );
  }

  const UniversityIcon = room.university?.icon || DefaultUniversityIcon;

  return (
    <div className="flex flex-col min-h-screen bg-muted/40"> {/* Page background */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 bg-background border-b flex items-center justify-between h-14">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-foreground">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFavorite} className="text-foreground">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow pb-32 md:pb-10 pt-14">
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
              <MapPin className="h-16 w-16" />
            </div>
          )}
          {room.images.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute bottom-4 right-4 z-10 bg-black/60 text-white px-2.5 py-1 text-xs rounded-full shadow-md"
            >
              {currentImageIndex + 1} / {room.images.length}
            </Badge>
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
            </>
          )}
        </div>

        <div className="bg-background rounded-t-3xl p-5 md:p-8 space-y-6 max-w-full mx-auto -mt-6 md:-mt-8 relative z-10 shadow-xl">
          <section className="text-center">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground leading-tight">
              {room.type} com Ar-condicionado e Wi-Fi – Próximo à {room.university.acronym}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Quarto em {room.university.city}, Brasil
            </p>
          </section>

          <Separator />

          <section className="text-sm text-foreground flex flex-row flex-wrap justify-center items-center gap-x-4 sm:gap-x-6 gap-y-2">
            <div className="flex items-center space-x-1.5">
              <Bed className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{room.beds} cama(s)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Banheiro {room.baths > 0 ? 'privativo' : 'compartilhado'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{room.guests} hóspede(s)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <UniversityIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Próximo à {room.university.acronym}</span>
            </div>
          </section>

          {room.rating > 0 && (
            <>
              <Separator />
              <section className="flex justify-center items-center space-x-6 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-base font-medium text-foreground mb-0.5">{room.rating.toFixed(2)}</p>
                  <div className="flex items-center space-x-0.5">
                      {renderStars(room.rating)}
                  </div>
                </div>
                <div className="h-8 border-l border-border"></div> {/* Vertical separator */}
                <div className="flex flex-col items-center">
                  <p className="text-base font-medium text-foreground">{room.reviews}</p>
                  <p className="text-xs text-muted-foreground">avaliações</p>
                </div>
              </section>
            </>
          )}

          <Separator />

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Descrição</h2>
            <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {room.description}
            </p>
          </section>

          {room.amenities.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">O que este lugar oferece</h2>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md flex-grow text-base py-3"
            >
              {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (room.isAvailable ? 'Conferir disponibilidade' : 'Indisponível')}
            </Button>
        </div>
      </div>

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

