
"use client";

import type { Listing } from '@/packages/types';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/packages/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const currentImage = listing.images[0]?.url || `https://placehold.co/800x600.png?text=${encodeURIComponent(listing.title)}`;
  const currentImageAlt = listing.images[0]?.alt || listing.title;
  const suggestedDate = "20 - 25 de out"; // Mock data

  return (
    <Link href={`/room/${listing.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
      {/* Aplicando padding geral ao card (p-3). O card em si mantém rounded-2xl e shadow-sm. */}
      <div className="flex flex-col h-full overflow-hidden rounded-2xl shadow-sm bg-card p-3">
        {/* Contêiner da Imagem: rounded-xl para ser um pouco menor que o card. */}
        <div className="relative w-full aspect-[4/3.5] overflow-hidden rounded-xl">
          <Image
            src={currentImage}
            alt={currentImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="apartment room interior"
          />
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
              {listing.images.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                    i === 0 ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contêiner do Texto: pt-3 para espaçamento superior, sem padding horizontal próprio pois o card já tem p-3. */}
        <div className="pt-3 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground truncate">
              {listing.university.city}, {listing.university.name}
            </h3>
            {listing.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap shrink-0 ml-2">
                <Star className="h-3.5 w-3.5 text-foreground fill-current" />
                <span>{listing.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {listing.type}
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
