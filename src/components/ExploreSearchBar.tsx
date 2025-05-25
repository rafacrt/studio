
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ExploreSearchBarProps {
  onSearch?: (term: string) => void;
  initialSearchTerm?: string;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
}

export function ExploreSearchBar({
  onSearch,
  initialSearchTerm = '',
  showFilterButton = true,
  onFilterClick
}: ExploreSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm shadow-sm px-4 py-3 md:px-6">
      <div className="flex items-center w-full max-w-3xl mx-auto bg-card border border-border rounded-full shadow-md focus-within:shadow-lg transition-shadow h-14 px-3 group">
        <Search className="h-5 w-5 text-muted-foreground ml-2 mr-2.5 shrink-0 group-focus-within:text-primary" />
        <div className="flex flex-col flex-grow mr-2">
          <input
            type="text"
            placeholder="Onde deseja ir?"
            className="text-sm font-semibold text-foreground placeholder:font-semibold placeholder-foreground focus:outline-none bg-transparent w-full pt-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="text-xs text-muted-foreground pb-1">
            <span>Qualquer data</span>
            <span className="mx-1">·</span>
            <span>Qualquer hóspede</span>
          </div>
        </div>
        {showFilterButton && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border flex-shrink-0 bg-background hover:bg-muted mr-1"
            onClick={onFilterClick}
            aria-label="Filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
