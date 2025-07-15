
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingCard } from '@/web/components/ListingCard';
import { fetchListings, roomCategories } from '@/packages/lib/mock-data';
import type { Listing, Category, ListingFilters } from '@/packages/types';
import { Loader2, Search, SlidersHorizontal, MapPin, LogOut } from 'lucide-react';
import { useToast } from '@/web/hooks/use-toast';
import { Skeleton } from '@/web/components/ui/skeleton';
import { Button } from '@/web/components/ui/button';
import { useAuth } from '@/packages/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { ExploreSearchBar } from '@/web/components/ExploreSearchBar';
import { CategoryMenu } from '@/web/components/CategoryMenu';

const ITEMS_PER_PAGE = 8;

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { logout, user } = useAuth();
  const router = useRouter();

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
    [isLoading, isLoadingMore, hasMore] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { toast } = useToast();

  const loadListings = useCallback(async (filters: ListingFilters, forPage: number) => {
    try {
      const newItems = await fetchListings(forPage, ITEMS_PER_PAGE, filters);
      if (forPage === 1) {
        setListings(newItems);
      } else {
        setListings(prev => [...prev, ...newItems]);
      }
      setPage(forPage + 1);
      setHasMore(newItems.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Falha ao carregar quartos:", err);
      toast({ title: "Erro", description: "Não foi possível carregar os quartos.", variant: "destructive" });
      setHasMore(false);
    }
  }, [toast]);

  const handleSearch = (searchTerm: string) => {
    setIsLoading(true);
    setListings([]);
    loadListings({ searchTerm, category: activeCategory }, 1).finally(() => setIsLoading(false));
  };
  
  const handleSelectCategory = (categoryId: string | null) => {
    setIsLoading(true);
    setListings([]);
    setActiveCategory(categoryId);
    loadListings({ category: categoryId }, 1).finally(() => setIsLoading(false));
  };

  const loadMoreListings = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await loadListings({ category: activeCategory }, page).finally(() => setIsLoadingMore(false));
  }, [isLoading, isLoadingMore, hasMore, page, activeCategory, loadListings]);

  useEffect(() => {
    setIsLoading(true);
    setListings([]);
    loadListings({ category: activeCategory }, 1).finally(() => setIsLoading(false));
  }, [activeCategory, loadListings]);
  
  const handleLogout = () => {
    logout();
    router.push('/login?message=Logout realizado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background">
      <ExploreSearchBar onSearch={handleSearch} />
      <CategoryMenu categories={roomCategories} selectedCategory={activeCategory} onSelectCategory={handleSelectCategory} />
      
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-card p-3">
                <Skeleton className="aspect-[4/3.5] w-full rounded-xl" />
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-5 w-1/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
              {listings.map((listing, index) => {
                const isLastElement = listings.length === index + 1;
                if (isLastElement && hasMore && !isLoadingMore) {
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
         <div className="mt-12 flex justify-center">
          <Button variant="outline" onClick={handleLogout} className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
