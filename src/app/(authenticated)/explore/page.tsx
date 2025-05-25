
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { fetchListings, roomCategories } from '@/lib/mock-data';
import type { Listing, ListingFilters } from '@/types'; // Removed Category type as it's imported in CategoryMenu
import { Loader2, MapPin, LogOut } from 'lucide-react'; // Removed Search, SlidersHorizontal
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Added Button
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { useRouter } from 'next/navigation'; // Added useRouter
import { ExploreSearchBar } from '@/components/ExploreSearchBar'; // Import new component
import { CategoryMenu } from '@/components/CategoryMenu'; // Import new component


const ITEMS_PER_PAGE = 9;

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { logout } = useAuth(); // For logout button
  const router = useRouter(); // For logout button

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

  const handleSearch = (searchTerm: string) => {
    setCurrentFilters(prev => ({ ...prev, searchTerm: searchTerm.trim() ? searchTerm.trim() : undefined, category: selectedCategory || undefined }));
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentFilters(prev => ({ ...prev, category: categoryId || undefined, searchTerm: prev.searchTerm }));
  };
  
  const handleLogout = () => {
    logout();
    router.push('/login?message=Logout realizado com sucesso');
  };

  // Placeholder for filter modal logic
  const handleFilterClick = () => {
    toast({ title: "Filtros", description: "Funcionalidade de filtros avançados em desenvolvimento." });
  };

  return (
    <div className="min-h-screen bg-background">
      <ExploreSearchBar onSearch={handleSearch} onFilterClick={handleFilterClick} />
      <CategoryMenu categories={roomCategories} selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
      
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-card">
                <Skeleton className="aspect-[1/1] md:aspect-[4/3.5] w-full rounded-t-xl" />
                <div className="p-3 space-y-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
