"use client";

import type { Listing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { triggerHapticFeedback } from '@/lib/utils';

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
            data-ai-hint="apartment interior"
          />
        </div>
        <CardContent className="p-4 space-y-1">
          <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center justify-between pt-1">
            <p className="text-sm font-medium text-foreground">
              ${listing.pricePerNight} <span className="text-xs text-muted-foreground">/ night</span>
            </p>
            <StarRating rating={listing.rating} size={14} showText={false} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
