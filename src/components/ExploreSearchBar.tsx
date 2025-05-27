
"use client";

import { useState } from 'react';
import { Search } from 'lucide-react'; // Removed SlidersHorizontal

interface ExploreSearchBarProps {
  onSearch?: (term: string) => void;
  initialSearchTerm?: string; // Added for consistency with room detail page usage
  showFilterButton?: boolean; // This prop is now effectively unused if button is always removed
}

export function ExploreSearchBar({
  onSearch,
  initialSearchTerm = "",
  // showFilterButton can be kept for future use or removed if definitely not needed
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
        <input
          type="text"
          placeholder="Onde deseja ir?"
          className="text-sm font-semibold text-foreground placeholder:font-semibold placeholder-muted-foreground focus:outline-none bg-transparent w-full h-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* Filter button removed */}
      </div>
    </div>
  );
}
