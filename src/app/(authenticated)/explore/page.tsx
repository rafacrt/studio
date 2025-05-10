
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Listing } from '@/types';
import { fetchListings } from '@/lib/mock-data';
import { ListingCard } from '@/components/ListingCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LISTINGS_PER_PAGE = 9; // Adjusted to 9

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const observer = useRef<IntersectionObserver | null>(null);

  const loadListings = useCallback(async (currentPage: number, currentSearchTerm: string) => {
    setIsLoading(true);
    try {
      // Pass search term if your fetchListings supports it, otherwise filter client-side
      const newFetchedListings = await fetchListings(currentPage, LISTINGS_PER_PAGE);
      
      // Client-side filtering (if backend doesn't filter)
      const filteredBySearch = newFetchedListings.filter(listing =>
        listing.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        listing.location.address.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        listing.universityName.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        listing.universityAcronym.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );

      setListings(prevListings => {
        // If it's the first page (either initial load or new search), replace listings
        if (currentPage === 1) {
          return filteredBySearch;
        }
        // Otherwise, append unique new listings for infinite scroll
        const currentListingIds = new Set(prevListings.map(l => l.id));
        const uniqueNewListings = filteredBySearch.filter(l => !currentListingIds.has(l.id));
        return [...prevListings, ...uniqueNewListings];
      });
      setHasMore(newFetchedListings.length === LISTINGS_PER_PAGE && filteredBySearch.length > 0);
      
    } catch (error) {
      console.error("Falha ao buscar quartos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    // Reset page to 1 and load listings when search term changes or on initial mount
    setPage(1); 
    // Pass `searchTerm` to `loadListings`
    loadListings(1, searchTerm); 
  }, [loadListings, searchTerm]); // Depend on searchTerm


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
    // Load more listings when page changes (for infinite scroll)
    // but only if it's not the initial load (page > 1)
    if (page > 1) { 
      loadListings(page, searchTerm); // Pass searchTerm here as well
    }
  }, [page, loadListings, searchTerm]); // Depend on searchTerm
  
  // Filtered listings are now directly set by `loadListings` when searchTerm changes.
  // For infinite scroll, `loadListings` appends, and client-side filtering is applied there.
  // So, `listings` state already contains the correctly filtered items.

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
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"> 
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {listings.map((listing, index) => {
            if (listings.length === index + 1) {
              return <div ref={lastListingElementRef} key={`${listing.id}-${index}`}><ListingCard listing={listing} /></div>;
            }
            return <ListingCard key={`${listing.id}-${index}`} listing={listing} />;
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
       {listings.length === 0 && !isLoading && ( // Show this when no results for the search term and not loading
        <p className="mt-8 text-center text-muted-foreground">Nenhum quarto encontrado para "{searchTerm}".</p>
      )}
    </div>
  );
}
