
"use client";

import { useRef } from 'react';
import type { Category } from '@/packages/types';
import { cn } from '@/lib/utils';

interface CategoryMenuProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory?: (categoryId: string | null) => void; // Made optional
}

export function CategoryMenu({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryMenuProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId === selectedCategory ? null : categoryId);
    }
  };

  return (
    <div className={cn(
        "sticky top-[76px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-2 md:px-0",
        "hidden" // Adicionada classe para ocultar o menu
    )}>
      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto py-3 hide-scrollbar justify-start md:justify-center max-w-5xl mx-auto px-2 md:px-4" // Added max-width and mx-auto for centering container
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "flex flex-col items-center space-y-1 pb-2 group whitespace-nowrap focus:outline-none transition-colors duration-200 flex-shrink-0", // Added flex-shrink-0
              selectedCategory === category.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={selectedCategory === category.id}
            disabled={!onSelectCategory} // Disable button if no handler
          >
            <category.icon className={cn("h-6 w-6 transition-transform duration-200 group-hover:scale-110", selectedCategory === category.id ? "text-primary" : "")} />
            <span className="text-xs font-medium">
              {category.label}
            </span>
            <div className={cn(
              "h-0.5 w-full mt-1 transition-all duration-200",
              selectedCategory === category.id ? "bg-primary" : "bg-transparent group-hover:bg-muted-foreground/30"
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
