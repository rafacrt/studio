
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
      {/* Div intermediário para aplicar o comportamento de 'container' */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Contêiner visual da barra de busca: w-[94%] e mx-auto para centralizar dentro do div.container. Adicionado flex justify-center items-center */}
        <div className="custom-explore-search-bar-width-control flex justify-center items-center w-[94%] mx-auto bg-card border border-border rounded-full h-14 px-3 group focus-within:shadow-lg transition-shadow">
          <Search className="h-4 w-4 text-black shrink-0 mr-2" /> {/* Ícone da lupa, cor preta, tamanho menor, margem à direita */}
          <input
            type="text"
            placeholder="Onde você quer morar hoje?"
            className="text-xs font-semibold text-foreground placeholder:text-xs placeholder:font-semibold placeholder:text-black focus:outline-none bg-transparent h-full" // Placeholder negrito, cor preta, input não mais text-center
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}

