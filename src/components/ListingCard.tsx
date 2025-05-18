"use client";

import type { Listing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users, Star, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const UniversityIcon: LucideIcon = listing.university?.icon || School;

  return (
    <Link href={`/room/${listing.id}`} className="block group">
      <Card className="overflow-hidden shadow-lg rounded-xl h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={listing.images[0]?.url || `https://placehold.co/600x400.png?text=${encodeURIComponent(listing.title)}`}
            alt={listing.images[0]?.alt || listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="apartment room"
          />
          {listing.university && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground py-1 px-2.5 rounded-full flex items-center shadow-md"
            >
              <UniversityIcon className="h-4 w-4 mr-1.5 text-primary" />
              <span className="text-xs font-medium">{listing.university.acronym}</span>
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-semibold leading-tight truncate group-hover:text-primary transition-colors">
            {listing.title}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{listing.university?.city || 'Localização não informada'}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-3 flex-grow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-primary">
              R$ {listing.pricePerNight.toLocaleString('pt-BR')}
              <span className="text-xs font-normal text-muted-foreground">/mês</span>
            </p>
            {listing.rating > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{listing.rating.toFixed(1)}</span>
                </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center">
              <Bed className="h-3.5 w-3.5 mr-1.5" /> {listing.beds} cama(s)
            </div>
            <div className="flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1.5" /> {listing.baths} banheiro(s)
            </div>
             <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5" /> Para {listing.guests} pessoa(s)
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t mt-auto">
           <Button variant="outline" className="w-full mt-3 text-primary border-primary hover:bg-primary/10 hover:text-primary">
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
