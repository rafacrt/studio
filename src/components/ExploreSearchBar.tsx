
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
    // Contêiner sticky: sombra cinza claro, padding vertical.
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm py-5 md:py-3 shadow-[0px_0px_15px_0px_#bebebe]">
      {/* Novo div intermediário para aplicar o comportamento de 'container' */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Contêiner visual da barra de busca: ocupa a largura do seu pai (o div.container) */}
        <div className="flex items-center w-full bg-card border border-border rounded-full h-14 px-3 group focus-within:shadow-lg transition-shadow">
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
    </div>
  );
}
