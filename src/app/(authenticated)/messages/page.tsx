
"use client";

import { ExploreSearchBar } from '@/components/ExploreSearchBar';
import { CategoryMenu } from '@/components/CategoryMenu';
import { roomCategories } from '@/lib/mock-data';
import { MessageSquareText } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de Busca e Menu de Categorias para consistência visual, sem funcionalidade ativa aqui */}
      <ExploreSearchBar />
      <CategoryMenu categories={roomCategories} selectedCategory={null} />
      
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <MessageSquareText className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Mensagens
        </h1>
        <p className="text-lg text-muted-foreground">
          Funcionalidade de mensagens em desenvolvimento.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Em breve você poderá se comunicar com outros usuários por aqui!
        </p>
      </div>
    </div>
  );
}
