
"use client";

import { useState } from 'react';
import { Search } from 'lucide-react'; 

interface ExploreSearchBarProps {
  onSearch?: (term: string) => void;
  initialSearchTerm?: string; 
}

export function ExploreSearchBar({
  onSearch,
  initialSearchTerm = "",
}: ExploreSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };
  
  return (
    // Contêiner sticky: sombra personalizada aplicada aqui.
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm px-4 py-3 md:px-6 shadow-[0_0px_10px_0_#000000]">
      {/* Contêiner visual da barra de busca: SEM sombra customizada própria, mas pode ter focus-within. */}
      <div className="flex items-center w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto bg-card border border-border rounded-full h-14 px-3 group focus-within:shadow-lg transition-shadow">
        <Search className="h-5 w-5 text-muted-foreground ml-2 mr-2.5 shrink-0 group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Onde você quer morar hoje?"
          className="text-sm font-semibold text-foreground placeholder:font-semibold placeholder-muted-foreground focus:outline-none bg-transparent w-full h-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
