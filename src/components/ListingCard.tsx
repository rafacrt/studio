
"use client";

import type { Listing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { triggerHapticFeedback } from '@/lib/utils';
import { School } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/room/${listing.id}`} className="block group" onClick={() => triggerHapticFeedback(5)}>
      <Card className="overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="aspect-[16/9] overflow-hidden">
          <Image
            src={listing.images[0]}
            alt={listing.title}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="student room interior"
          />
        </div>
        <CardContent className="p-4 space-y-1">
          <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {listing.location.address.split(',').slice(0, 2).join(', ').trim()}
          </p>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <School size={14} className="mr-1 text-primary" />
            <span>Próximo à {listing.universityAcronym}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-sm font-medium text-foreground">
              R${listing.pricePerNight.toFixed(0)} <span className="text-xs text-muted-foreground">/ mês (aprox.)</span>
            </p>
            <StarRating rating={listing.rating} size={14} showText={true} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
