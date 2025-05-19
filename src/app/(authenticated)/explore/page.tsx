
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { fetchListings } from '@/lib/mock-data';
import type { Listing, ListingFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 9;

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastListingElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMoreListings();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMore]
  );

  const { toast } = useToast();

  const loadInitialListings = useCallback(async (filters: ListingFilters) => {
    setIsLoading(true);
    setListings([]);
    setPage(1);
    try {
      const newItems = await fetchListings(1, ITEMS_PER_PAGE, filters);
      setListings(newItems);
      setPage(2);
      setHasMore(newItems.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Falha ao carregar quartos:", err);
      toast({ title: "Erro", description: "Não foi possível carregar os quartos.", variant: "destructive" });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMoreListings = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const newItems = await fetchListings(page, ITEMS_PER_PAGE, currentFilters);
      setListings(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setHasMore(newItems.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Falha ao carregar mais quartos:", err);
      toast({ title: "Erro", description: "Não foi possível carregar mais quartos.", variant: "destructive" });
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, page, currentFilters, toast]);

  useEffect(() => {
    loadInitialListings(currentFilters);
  }, [currentFilters, loadInitialListings]);


  const handleSearch = () => {
    const filters: ListingFilters = {};
    if (searchInput.trim()) filters.searchTerm = searchInput.trim();
    setCurrentFilters(filters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 shadow-lg rounded-xl bg-transparent border-none">
        <CardContent className="p-0 md:p-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Encontre seu quarto ideal"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-14 w-full rounded-full pl-12 pr-6 text-base shadow-md focus-visible:ring-primary" 
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-lg rounded-xl">
              <Skeleton className="h-52 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, index) => {
              if (listings.length === index + 1) {
                return <div ref={lastListingElementRef} key={listing.id}><ListingCard listing={listing} /></div>;
              }
              return <ListingCard key={listing.id} listing={listing} />;
            })}
          </div>
          {isLoadingMore && (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Carregando mais quartos...</p>
            </div>
          )}
          {!hasMore && listings.length > 0 && (
            <p className="text-center text-muted-foreground py-8">Você chegou ao fim da lista.</p>
          )}
        </>
      ) : (
        <div className="text-center py-16">
            <MapPin className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhum quarto encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar seus filtros ou ampliar sua busca.</p>
        </div>
      )}
    </div>
  );
}
    
