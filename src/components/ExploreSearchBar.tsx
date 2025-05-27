
"use client";

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react'; // SlidersHorizontal for filter icon
import { Button } from '@/components/ui/button'; // For filter button

interface ExploreSearchBarProps {
  onSearch?: (term: string) => void;
  // onFilterClick prop removed as filter button functionality is now illustrative
}

export function ExploreSearchBar({
  onSearch,
}: ExploreSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };
  
  // Placeholder for filter click, can be removed if not needed for visual mock
  const handleFilterIconClick = () => {
    // In a real app, this would open a filter modal
    console.log("Filter icon clicked - (Placeholder)");
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm shadow-sm px-4 py-3 md:px-6">
      <div className="flex items-center w-full max-w-3xl mx-auto bg-card border border-border rounded-full shadow-md focus-within:shadow-lg transition-shadow h-14 px-3 group">
        <Search className="h-5 w-5 text-muted-foreground ml-2 mr-2.5 shrink-0 group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Onde deseja ir?"
          className="text-sm font-semibold text-foreground placeholder:font-semibold placeholder-foreground focus:outline-none bg-transparent w-full h-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* Illustrative Filter Button - can be made functional later */}
        <Button
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full flex-shrink-0 hover:bg-muted ml-2"
            onClick={handleFilterIconClick} 
            aria-label="Filtros"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </Button>
      </div>
    </div>
  );
}
