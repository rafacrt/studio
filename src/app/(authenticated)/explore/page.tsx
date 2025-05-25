
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { fetchListings, roomCategories } from '@/lib/mock-data'; // Added roomCategories
import type { Listing, ListingFilters, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 9;

// New Search Bar Component (inline for simplicity, can be extracted)
function ExploreSearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background shadow-sm px-4 py-3 md:px-6">
      <div className="flex items-center w-full max-w-2xl mx-auto">
        <div className="flex-grow flex items-center bg-background border border-border rounded-full shadow-md hover:shadow-lg transition-shadow h-12 px-3">
          <Search className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <div className="flex flex-col flex-grow mr-2">
            <input
              type="text"
              placeholder="Onde deseja ir?"
              className="text-sm font-medium text-foreground placeholder-foreground focus:outline-none bg-transparent w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="text-xs text-muted-foreground">
              <span>Qualquer data</span>
              <span className="mx-1">·</span>
              <span>Qualquer hóspede</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="icon" className="ml-3 h-10 w-10 rounded-full border flex-shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Filtros</span>
        </Button>
      </div>
    </div>
  );
}

// New Category Menu Component (inline for simplicity)
function CategoryMenu({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: Category[]; 
  selectedCategory: string | null; 
  onSelectCategory: (categoryId: string | null) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-[68px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6">
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto py-3 hide-scrollbar" // Added hide-scrollbar
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id === selectedCategory ? null : category.id)}
            className={cn(
              "flex flex-col items-center space-y-1 pb-2 group whitespace-nowrap focus:outline-none",
              selectedCategory === category.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={selectedCategory === category.id}
          >
            <category.icon className={cn("h-5 w-5 transition-colors", selectedCategory === category.id ? "text-foreground" : "")} />
            <span className="text-xs font-medium transition-colors">
              {category.label}
            </span>
            <div className={cn(
              "h-0.5 w-full mt-1 transition-all duration-200",
              selectedCategory === category.id ? "bg-foreground" : "bg-transparent group-hover:bg-muted-foreground/50"
            )} />
          </button>
        ))}
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    setCurrentFilters(prev => ({ ...prev, searchTerm: searchTerm.trim() ? searchTerm.trim() : undefined }));
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentFilters(prev => ({ ...prev, category: categoryId || undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <ExploreSearchBar onSearch={handleSearch} />
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
      </div>
    </div>
  );
}
