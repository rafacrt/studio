import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types';
import * as LucideIcons from 'lucide-react';

// Mapeia o nome do ícone para o componente real
const mapIcon = (iconName: string | null | undefined): React.ComponentType | undefined => {
    if (!iconName) return undefined;
    const iconKey = iconName as keyof typeof LucideIcons;
    return LucideIcons[iconKey];
};


export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      throw error;
    }
    
    // A API retornará os nomes dos ícones. O cliente (app móvel/web)
    // será responsável por mapear esses nomes para os componentes de ícone reais.
    // Nós não retornamos componentes React de uma API.
    const categories = data.map(cat => ({
        id: cat.id,
        label: cat.label,
        description: cat.description,
        icon: cat.icon_name, // Retornando apenas o nome do ícone como string
    }));

    return NextResponse.json(categories, { status: 200 });

  } catch (error: any) {
    console.error('API Error fetching categories:', error);
    return NextResponse.json({ message: 'Erro ao buscar as categorias', error: error.message }, { status: 500 });
  }
}
