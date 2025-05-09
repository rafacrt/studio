"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Listing, Amenity, Review } from '@/types';
import { fetchListingById } from '@/lib/mock-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/StarRating';
import { ChevronLeft, ChevronRight, MapPin, Users, BedDouble, Bath, Star, Share2, Heart, Loader2 } from 'lucide-react';
import { triggerHapticFeedback, simulateApiCall } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

function ListingDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      const loadListing = async () => {
        setIsLoading(true);
        const fetchedListing = await fetchListingById(id);
        if (fetchedListing) {
          setListing(fetchedListing);
        } else {
          // Handle listing not found, e.g., redirect or show error
          toast({ title: "Error", description: "Listing not found.", variant: "destructive" });
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

  const handleReserve = async () => {
    triggerHapticFeedback();
    toast({
      title: "Booking Simulated",
      description: `Reservation for "${listing.title}" has been initiated.`,
      variant: "default"
    });
    // In a real app, navigate to a booking confirmation page or modal.
    // For demo, just show a toast.
  };

  const amenitiesToShow = 4;

  return (
    <div className="pb-24"> {/* Padding for fixed CTA */}
      {/* Image Gallery */}
      <div className="relative h-72 md:h-96 group">
        <Image
          src={listing.images[currentImageIndex]}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300"
          data-ai-hint="room interior"
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
          {listing.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'} transition-all`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/30 to-transparent">
           <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full" onClick={() => router.back()}>
            <ChevronLeft size={24} />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full"><Share2 size={20}/></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full"><Heart size={20}/></Button>
          </div>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <StarRating rating={listing.rating} size={16} />
          <span>·</span>
          <Link href="#reviews" className="underline">{listing.reviews.length} reviews</Link>
          <span>·</span>
          <MapPin size={14} className="inline" />
          <span>{listing.location.address.split(',')[1]?.trim() || listing.location.address.split(',')[0]?.trim()}</span>
        </div>
        <Separator />
        
        {/* Hosted by */}
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={listing.host.avatarUrl} alt={listing.host.name} data-ai-hint="person portrait" />
            <AvatarFallback>{listing.host.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-medium text-foreground">Hosted by {listing.host.name}</p>
            <p className="text-sm text-muted-foreground">Superhost · 5 years hosting</p>
          </div>
        </div>
        <Separator />

        {/* Basic Specs */}
        <div className="flex space-x-4 text-sm text-foreground">
          <span className="flex items-center"><Users size={18} className="mr-1.5 text-muted-foreground"/> {listing.guests} guests</span>
          <span className="flex items-center"><BedDouble size={18} className="mr-1.5 text-muted-foreground"/> {listing.bedrooms} bedroom</span>
          <span className="flex items-center"><Sofa size={18} className="mr-1.5 text-muted-foreground"/> {listing.beds} bed</span>
          <span className="flex items-center"><Bath size={18} className="mr-1.5 text-muted-foreground"/> {listing.baths} bath</span>
        </div>
        <Separator />

        {/* Description Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">About this place</h2>
          <p className={`text-sm text-foreground transition-all duration-300 ease-in-out ${showFullDescription ? 'line-clamp-none' : 'line-clamp-4'}`}>
            {listing.description}
          </p>
          <Button variant="link" onClick={() => setShowFullDescription(!showFullDescription)} className="p-0 h-auto text-primary text-sm font-medium">
            {showFullDescription ? 'Show less' : 'Show more'} <ChevronRight size={16} className={`ml-1 transform transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        <Separator />

        {/* Amenities Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">What this place offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {listing.amenities.slice(0, amenitiesToShow).map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2 text-sm">
                <amenity.icon size={20} className="text-muted-foreground" />
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>
          {listing.amenities.length > amenitiesToShow && (
            <Button variant="outline" className="mt-4 w-full sm:w-auto">Show all {listing.amenities.length} amenities</Button>
          )}
        </div>
        <Separator />

        {/* Location Section (Placeholder Map) */}
        <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Where you'll be</h2>
            <p className="text-sm text-muted-foreground mb-2">{listing.location.address}</p>
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <Image src={`https://picsum.photos/seed/${listing.id}_map/600/300`} alt="Map placeholder" width={600} height={300} className="rounded-lg object-cover" data-ai-hint="map city" />
            </div>
        </div>
        <Separator />

        {/* Reviews Section */}
        <div id="reviews">
          <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center">
            <Star size={20} className="mr-2 text-yellow-400 fill-yellow-400" /> {listing.rating.toFixed(1)} ({listing.reviews.length} reviews)
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
                    <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} showText={false} className="mb-1"/>
                <p className="text-foreground line-clamp-3">{review.comment}</p>
              </div>
            ))}
          </div>
          {listing.reviews.length > 2 && (
            <Button variant="outline" className="mt-4 w-full sm:w-auto">Show all {listing.reviews.length} reviews</Button>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/90 border-t p-4 backdrop-blur-md z-40 shadow-top-md md:bottom-0">
        <div className="container mx-auto flex items-center justify-between max-w-3xl">
          <div>
            <p className="text-lg font-semibold text-foreground">${listing.pricePerNight} <span className="text-sm font-normal text-muted-foreground">/ night</span></p>
            {/* Optional: Dates can be added here */}
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md" onClick={handleReserve}>
            Reserve
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

