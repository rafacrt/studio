
"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';

interface ExploreSearchBarProps {
  onSearch?: (term: string) => void;
  initialSearchTerm?: string;
  showFilterButton?: boolean;
}

export function ExploreSearchBar({
  onSearch,
  initialSearchTerm = "",
  showFilterButton = true,
}: ExploreSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    // Contêiner sticky: agora com classe customizada para sombra, padding vertical.
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm py-5 md:py-3 custom-sticky-search-shadow">
      {/* Div intermediário para aplicar o comportamento de 'container' */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Contêiner visual da barra de busca: w-[94%] e mx-auto para centralizar. Adicionado border-0 */}
        <div className="custom-explore-search-bar-width-control border-0 flex justify-center items-center w-[94%] mx-auto rounded-full h-14 px-3 group focus-within:shadow-lg transition-shadow">
          <Search className="h-4 w-4 text-black shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Onde você quer morar hoje?"
            className="text-xs font-semibold text-foreground placeholder:text-xs placeholder:font-semibold placeholder:text-black focus:outline-none bg-transparent h-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
