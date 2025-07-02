
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ListingFilters } from '@/types';

// Mapeia os dados do Supabase para o tipo Listing do nosso app
const mapToListing = (data: any[]): any[] => {
  return data.map(item => ({
    ...item,
    pricePerNight: item.price_per_night,
    university: {
      name: item.university_name,
      acronym: item.university_acronym,
      city: item.university_city,
    },
    host: {
      name: item.profiles?.name,
      avatarUrl: item.profiles?.avatar_url,
    },
    images: item.listings_images,
    category: item.category_id,
    // Remove os campos que não queremos expor ou que foram mapeados
    price_per_night: undefined, 
    university_name: undefined,
    university_acronym: undefined,
    university_city: undefined,
    profiles: undefined,
    listings_images: undefined,
    category_id: undefined,
    host_id: undefined,
  }));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const filters: ListingFilters = {
      searchTerm: searchParams.get('searchTerm') || undefined,
      category: searchParams.get('category') || undefined,
    };
    
    const supabase = createClient();
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles ( name, avatar_url ),
        listings_images ( url, alt )
      `);

    // Aplica filtros
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,university_city.ilike.%${filters.searchTerm}%`);
    }
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }

    // Aplica paginação
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
    
    // Executa a query
    const { data, error } = await query;

    if (error) {
      throw error;
    }
    
    // Mapeia e retorna os dados
    const listings = mapToListing(data);
    return NextResponse.json(listings, { status: 200 });

  } catch (error: any) {
    console.error('API Error fetching listings:', error);
    return NextResponse.json({ message: 'Erro ao buscar os quartos', error: error.message }, { status: 500 });
  }
}
