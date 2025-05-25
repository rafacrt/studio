
"use client";

import type { Listing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  // For now, show only the first image. Carousel dots can be a future enhancement.
  const currentImage = listing.images[0]?.url || `https://placehold.co/800x600.png?text=${encodeURIComponent(listing.title)}`;
  const currentImageAlt = listing.images[0]?.alt || listing.title;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking favorite
    setIsFavorited(!isFavorited);
    // TODO: Add logic to update favorite status in backend/context
  };

  // Mocked data for now
  const suggestedDate = "20 - 25 de out";

  return (
    <Link href={`/room/${listing.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
      <div className="flex flex-col h-full overflow-hidden rounded-2xl shadow-sm bg-card transition-shadow duration-300">
        <div className="relative w-full aspect-[1/1] md:aspect-[4/3.5] overflow-hidden rounded-2xl"> {/* Image container with rounded corners */}
          <Image
            src={currentImage}
            alt={currentImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" // Removed group-hover:scale-105
            data-ai-hint="apartment room interior"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 h-8 w-8 p-0 rounded-full bg-background/70 hover:bg-background text-foreground hover:text-airbnb-primary"
            aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}
          >
            <Heart className={cn("h-4 w-4", isFavorited ? "fill-airbnb-primary text-airbnb-primary" : "text-current")} />
          </Button>
          {/* Image pagination dots */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
              {listing.images.slice(0, 5).map((_, i) => ( // Show up to 5 dots
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                    i === 0 ? "bg-white" : "bg-white/50" // Active dot is fully white
                  )}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground truncate">
              {listing.university.city}, {listing.university.name}
            </h3>
            {listing.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap shrink-0 ml-2">
                <Star className="h-3 w-3 text-foreground fill-current" /> 
                <span>{listing.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {listing.type} {/* Ex: Quarto Individual, Studio */}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {suggestedDate}
          </p>
          <p className="text-sm font-semibold text-foreground mt-auto">
            R$ {listing.pricePerNight.toLocaleString('pt-BR')}
            <span className="font-normal text-xs"> /mês</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
