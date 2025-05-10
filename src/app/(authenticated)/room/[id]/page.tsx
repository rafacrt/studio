
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Listing } from '@/types';
import { fetchListingById } from '@/lib/mock-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/StarRating';
import { ChevronLeft, ChevronRight, MapPin, Users, BedDouble, Bath, Star, Share2, Heart, Loader2, Armchair, CheckCircle, School } from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useAuth } from '@/contexts/AuthContext';


function ListingDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isRented, setIsRented] = useState(false); 

  useEffect(() => {
    if (id) {
      const loadListing = async () => {
        setIsLoading(true);
        const fetchedListing = await fetchListingById(id);
        if (fetchedListing) {
          setListing(fetchedListing);
          const rentedRooms = JSON.parse(localStorage.getItem('rentedRooms') || '[]');
          if (rentedRooms.includes(id)) {
            setIsRented(true);
          }
        } else {
          toast({ title: "Erro", description: "Quarto não encontrado.", variant: "destructive" });
          router.push('/explore');
        }
        setIsLoading(false);
      };
      loadListing();
    }
  }, [id, router, toast]);

  if (isLoading || !listing) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);

  const handleRent = async () => {
    triggerHapticFeedback();
    if (!user) {
      toast({
        title: "Ação Necessária",
        description: "Você precisa estar logado para alugar um quarto.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    setIsLoading(true); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const rentedRooms = JSON.parse(localStorage.getItem('rentedRooms') || '[]');
    if (!rentedRooms.includes(listing.id)) {
      rentedRooms.push(listing.id);
      localStorage.setItem('rentedRooms', JSON.stringify(rentedRooms));
    }
    setIsRented(true);
    setIsLoading(false);

    toast({
      title: "Quarto Alugado!",
      description: `Você alugou "${listing.title}". Verifique seus aluguéis ativos.`,
      variant: "default",
      className: "bg-accent text-accent-foreground"
    });
  };

  const amenitiesToShow = 4;

  return (
    <div className="pb-24"> 
      <div className="relative h-72 md:h-96 group">
        <Image
          src={listing.images[currentImageIndex]}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300"
          data-ai-hint="student room interior"
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Próxima imagem"
        >
          <ChevronRight size={24} />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
          {listing.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'} transition-all`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/30 to-transparent">
           <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full" onClick={() => router.back()} aria-label="Voltar">
            <ChevronLeft size={24} />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full" aria-label="Compartilhar"><Share2 size={20}/></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full" aria-label="Favoritar"><Heart size={20}/></Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <StarRating rating={listing.rating} size={16} />
          <span>·</span>
          <Link href="#reviews" className="underline">{listing.reviews.length} avaliações</Link>
          <span>·</span>
          <MapPin size={14} className="inline" />
          <span>{listing.location.address.split(',')[1]?.trim() || listing.location.address.split(',')[0]?.trim()}</span>
        </div>
        <Separator />

        <div className="flex items-center space-x-2 text-foreground">
            <School size={20} className="text-primary" />
            <p className="text-sm">Próximo à <span className="font-medium">{listing.universityName} ({listing.universityAcronym})</span></p>
        </div>
        <Separator />
        
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={listing.host.avatarUrl} alt={listing.host.name} data-ai-hint="person portrait" />
            <AvatarFallback>{listing.host.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-medium text-foreground">Anfitrião(ã): {listing.host.name}</p>
            <p className="text-sm text-muted-foreground">Superhost · {Math.floor(Math.random() * 5) + 1} anos como anfitrião</p>
          </div>
        </div>
        <Separator />

        <div className="flex space-x-4 text-sm text-foreground">
          <span className="flex items-center"><Users size={18} className="mr-1.5 text-muted-foreground"/> {listing.guests} universitário(s)</span>
          <span className="flex items-center"><BedDouble size={18} className="mr-1.5 text-muted-foreground"/> {listing.bedrooms} quarto(s)</span>
          <span className="flex items-center"><Bath size={18} className="mr-1.5 text-muted-foreground"/> {listing.baths} banheiro(s)</span>
        </div>
        <Separator />

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Sobre este quarto</h2>
          <p className={`text-sm text-foreground transition-all duration-300 ease-in-out ${showFullDescription ? 'line-clamp-none' : 'line-clamp-4'}`}>
            {listing.description}
          </p>
          <Button variant="link" onClick={() => setShowFullDescription(!showFullDescription)} className="p-0 h-auto text-primary text-sm font-medium">
            {showFullDescription ? 'Mostrar menos' : 'Mostrar mais'} <ChevronRight size={16} className={`ml-1 transform transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        <Separator />

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">O que este quarto oferece</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {listing.amenities.slice(0, amenitiesToShow).map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2 text-sm">
                <amenity.icon size={20} className="text-muted-foreground" />
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>
          {listing.amenities.length > amenitiesToShow && (
            <Button variant="outline" className="mt-4 w-full sm:w-auto">Mostrar todas as {listing.amenities.length} comodidades</Button>
          )}
        </div>
        <Separator />

        <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Onde você vai estar</h2>
            <p className="text-sm text-muted-foreground mb-2">{listing.location.address}</p>
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <Image src={`https://picsum.photos/seed/${listing.id}_map/600/300`} alt="Localização no mapa" width={600} height={300} className="rounded-lg object-cover" data-ai-hint="map city" />
            </div>
        </div>
        <Separator />

        <div id="reviews">
          <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center">
            <Star size={20} className="mr-2 text-yellow-400 fill-yellow-400" /> {listing.rating.toFixed(1)} ({listing.reviews.length} avaliações)
          </h2>
          <div className="space-y-6">
            {listing.reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.userAvatarUrl} alt={review.userName} data-ai-hint="person avatar"/>
                    <AvatarFallback>{review.userName.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(review.date), "MMMM 'de' yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} showText={false} className="mb-1"/>
                <p className="text-foreground line-clamp-3">{review.comment}</p>
              </div>
            ))}
          </div>
          {listing.reviews.length > 2 && (
            <Button variant="outline" className="mt-4 w-full sm:w-auto">Mostrar todas as {listing.reviews.length} avaliações</Button>
          )}
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-background/90 border-t p-4 backdrop-blur-md z-40 shadow-top-md md:bottom-0">
        <div className="container mx-auto flex items-center justify-between max-w-3xl">
          <div>
            <p className="text-lg font-semibold text-foreground">R${listing.pricePerNight.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">/ mês (aprox.)</span></p>
          </div>
          <Button 
            size="lg" 
            className={`${isRented ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'} text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md`}
            onClick={handleRent}
            disabled={isLoading} // Disable only when processing rent, not if already rented
          >
            {isLoading && isRented === false ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isRented ? <CheckCircle className="mr-2 h-5 w-5" /> : null)}
            {isRented ? 'Alugado' : 'Alugar Quarto'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ListingDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ListingDetailsContent />
    </Suspense>
  );
}
