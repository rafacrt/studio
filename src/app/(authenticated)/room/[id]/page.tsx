
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Star, Bed, Bath, Users, Loader2, School2 as DefaultUniversityIcon, MapPin, ChevronRight, Map as MapIcon, MessageSquareText, FileText, Home, ShieldCheck } from 'lucide-react'; // Removed Heart
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getRoomById, bookMockRoom, roomCategories } from '@/lib/mock-data';
import type { Listing, Amenity as AmenityType, UniversityArea, ListingImage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ExploreSearchBar } from '@/components/ExploreSearchBar'; 
import { CategoryMenu } from '@/components/CategoryMenu'; 

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
        className: "bg-airbnb-primary text-airbnb-primary-foreground",
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
  
  // const handleFavoriteToggle = () => { // Favorite functionality removed
  //   if (room) {
  //      toast({ title: "Favoritos", description: `${room.title} ${ (Math.random() > 0.5) ? "adicionado aos" : "removido dos"} favoritos (mock).`});
  //   }
  // };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <ExploreSearchBar showFilterButton={false} /> 
        <div className="w-full px-4 md:px-6 lg:px-8 pt-6">
            <Skeleton className="w-full aspect-[4/3] md:aspect-video lg:aspect-[16/7] rounded-2xl" />
        </div>
        <div className="p-6 md:p-8 space-y-4 w-full max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
          <Separator />
          <Skeleton className="h-4 w-full mt-2" />
          <Separator />
          <Skeleton className="h-6 w-1/4 mb-2 mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 shadow-top-md z-20 md:hidden">
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
      <div className="flex flex-col min-h-screen bg-background">
        <ExploreSearchBar showFilterButton={false} />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-semibold mb-2">Quarto não encontrado</h1>
            <p className="text-muted-foreground mb-4">O quarto que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => router.push('/explore')} variant="outline">Voltar para Exploração</Button>
        </div>
      </div>
    );
  }

  const UniversityIcon = room.university?.icon || DefaultUniversityIcon;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ExploreSearchBar 
        onSearch={(term) => router.push(`/explore?search=${term}`)} 
        initialSearchTerm={room.university.city || room.title.substring(0,20)}
        showFilterButton={false} 
      />
      <CategoryMenu 
        categories={roomCategories} 
        selectedCategory={room.category || null} 
      />

      <main className="flex-grow pb-32 md:pb-10 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-[16/7] group overflow-hidden rounded-2xl shadow-lg">
            {room.images.length > 0 ? (
              <Image
                src={room.images[currentImageIndex]?.url || `https://placehold.co/1200x600.png?text=Imagem+Indisponível`}
                alt={room.images[currentImageIndex]?.alt || room.title}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                data-ai-hint="apartment interior detail"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                <MapPin className="h-16 w-16" />
              </div>
            )}
            
            {/* Favorite Button on Image Removed */}
            {/* <Button
              variant="ghost"
              size="icon"
              // onClick={handleFavoriteToggle} // Removed favorite toggle
              className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 p-1.5 rounded-full"
              aria-label="Favoritar"
            >
              <Heart className="h-5 w-5 text-white" fill="transparent" />
            </Button> */}

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
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-background p-6 md:p-8 space-y-6 max-w-4xl mx-auto relative z-10 mt-6">
          
          <section className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
              {room.title}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground space-x-2 flex-wrap">
              {room.rating > 0 && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-foreground fill-current mr-1" /> 
                  <span>{room.rating.toFixed(1)}</span>
                  <span className="mx-1.5">·</span>
                  <span className="hover:underline cursor-pointer">{room.reviews} avaliações</span>
                </div>
              )}
               {room.rating > 0 && <span className="hidden sm:inline mx-1.5">·</span>}
              <span className="hover:underline cursor-pointer">{room.university.city}, Brasil</span>
            </div>
          </section>

          <Separator />

          <section className="text-sm text-foreground">
            <p>
              {room.guests} hóspede(s)
              <span className="mx-1.5">·</span>
              {room.bedrooms} quarto(s)
              <span className="mx-1.5">·</span>
              {room.beds} cama(s)
              <span className="mx-1.5">·</span>
              {room.baths} banheiro(s)
              {room.baths > 0 && (room.amenities.some(a => a.id === 'privBathroom') ? ' privativo(s)' : ' compartilhado(s)')}
            </p>
            <p className="flex items-center mt-1">
                <UniversityIcon className="h-4 w-4 text-primary mr-1.5 flex-shrink-0" />
                <span>Próximo à {room.university.acronym}</span>
            </p>
          </section>
          
          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Descrição</h2>
            <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {room.description}
            </p>
          </section>

          {room.amenities.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">O que este lugar oferece</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
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

          <Separator />
          <section>
            <div className="flex items-center mb-3">
              <MapIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">Onde você estará</h2>
            </div>
            <div className="bg-muted rounded-3xl h-64 flex items-center justify-center text-muted-foreground p-4">
              <p>Espaço reservado para o mapa da localização.</p>
            </div>
             <p className="text-xs text-muted-foreground mt-3">Localização exata fornecida após a reserva.</p>
          </section>
          
          <Separator />
          <section>
             <div className="flex items-center mb-3">
                <MessageSquareText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <h2 className="text-xl font-semibold text-foreground">Avaliações</h2>
            </div>
             {room.rating > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-5 w-5 text-foreground fill-foreground" />
                    <p className="text-lg font-semibold text-foreground">{room.rating.toFixed(1)}</p>
                    <p className="text-lg text-muted-foreground">·</p>
                    <p className="text-lg text-muted-foreground hover:underline cursor-pointer">{room.reviews} avaliações</p>
                </div>
             )}
            <div className="bg-muted rounded-xl p-6 text-center text-muted-foreground">
              <p>Carrossel de avaliações dos usuários aparecerá aqui.</p>
            </div>
          </section>

          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Coisas para saber</h2>
            <div className="space-y-5">
                <div>
                    <div className="flex items-center mb-2">
                        <Home className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <h3 className="text-md font-semibold text-foreground">Regras da Casa</h3>
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 leading-relaxed whitespace-pre-line pl-2">
                      {room.houseRules.split('\\n').map((rule, index) => <li key={index}>{rule}</li>)}
                    </ul>
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <ShieldCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <h3 className="text-md font-semibold text-foreground">Saúde e segurança</h3>
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 leading-relaxed whitespace-pre-line pl-2">
                      {room.safetyAndProperty.split('\\n').map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <h3 className="text-md font-semibold text-foreground">Política de Cancelamento</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line pl-2">
                      {room.cancellationPolicy}
                    </p>
                </div>
            </div>
          </section>

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
              className="bg-airbnb-primary hover:bg-airbnb-primary/90 text-airbnb-primary-foreground font-semibold rounded-lg shadow-md flex-grow text-base py-3"
              style={{ backgroundColor: "hsl(var(--airbnb-primary))", color: "hsl(var(--airbnb-primary-foreground))"}}
            >
              {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (room.isAvailable ? 'Conferir disponibilidade' : 'Indisponível')}
            </Button>
        </div>
      </div>

      <div className="hidden md:block fixed bottom-6 right-6 z-20">
          <Card className="w-96 shadow-xl rounded-xl border">
              <CardHeader className="pb-4">
                  <CardTitle className="text-xl">
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
                      className="w-full bg-airbnb-primary hover:bg-airbnb-primary/90 text-airbnb-primary-foreground font-semibold rounded-lg shadow-md py-3 text-base"
                      style={{ backgroundColor: "hsl(var(--airbnb-primary))", color: "hsl(var(--airbnb-primary-foreground))"}}
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
