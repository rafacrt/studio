
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Listing } from '@/types';
import { fetchListings } from '@/lib/mock-data';
import { ListingCard } from '@/components/ListingCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LISTINGS_PER_PAGE = 12;

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const observer = useRef<IntersectionObserver | null>(null);

  const loadListings = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const newFetchedListings = await fetchListings(currentPage, LISTINGS_PER_PAGE);
      if (newFetchedListings.length > 0) {
        setListings(prevListings => {
          if (currentPage === 1) {
            // For the first page, or if we intend to reset (e.g. after a search term change)
            // We should replace the existing listings.
            return newFetchedListings;
          } else {
            // For subsequent pages (infinite scroll), append new listings.
            // Ensure no duplicates are added.
            const currentListingIds = new Set(prevListings.map(l => l.id));
            const uniqueNewListings = newFetchedListings.filter(l => !currentListingIds.has(l.id));
            return [...prevListings, ...uniqueNewListings];
          }
        });
        setHasMore(newFetchedListings.length === LISTINGS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Falha ao buscar quartos:", error);
      // Potentially show a toast message
    } finally {
      setIsLoading(false);
    }
  }, []); // LISTINGS_PER_PAGE is a constant, so no need to include in dependencies

  useEffect(() => {
    // Initial load: reset page to 1 and load.
    // This ensures that if the component re-mounts or for strict mode, page 1 is correctly (re)loaded.
    setPage(1); 
    loadListings(1);
  }, [loadListings]);

  const lastListingElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    // Load more listings when page changes, but only if it's not the initial load (page 1).
    // Initial load (page 1) is handled by the first useEffect.
    if (page > 1) { 
      loadListings(page);
    }
  }, [page, loadListings]);
  
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-40 bg-background/90 py-4 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por bairro, cidade, universidade..."
            className="w-full rounded-full bg-secondary pl-10 pr-4 py-2 h-11 text-base focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {listings.length === 0 && isLoading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: LISTINGS_PER_PAGE }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing, index) => {
            if (filteredListings.length === index + 1) {
              return <div ref={lastListingElementRef} key={listing.id}><ListingCard listing={listing} /></div>;
            }
            return <ListingCard key={listing.id} listing={listing} />;
          })}
        </div>
      )}

      {isLoading && listings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && listings.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">Não há mais quartos para mostrar.</p>
      )}
       {listings.length > 0 && filteredListings.length === 0 && !isLoading && (
        <p className="mt-8 text-center text-muted-foreground">Nenhum quarto encontrado para "{searchTerm}".</p>
      )}
    </div>
  );
}

