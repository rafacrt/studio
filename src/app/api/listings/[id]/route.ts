
import { NextResponse } from 'next/server';
import { createClient } from '@/packages/lib/supabase/server';

// Mapeia os dados do Supabase para o tipo Listing do nosso app
const mapToListingDetail = (item: any): any => {
  if (!item) return null;

  return {
    ...item,
    pricePerNight: item.price_per_night,
    university: {
      name: item.university_name,
      acronym: item.university_acronym,
      city: item.university_city,
    },
    host: {
      id: item.host_id,
      name: item.profiles?.name,
      avatarUrl: item.profiles?.avatar_url,
    },
    images: item.listings_images,
    category: item.categories, // Retorna o objeto completo da categoria
    
    // Remove os campos que não queremos expor ou que foram mapeados
    price_per_night: undefined, 
    university_name: undefined,
    university_acronym: undefined,
    university_city: undefined,
    profiles: undefined,
    listings_images: undefined,
    category_id: undefined,
    host_id: undefined,
  };
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: 'ID do quarto é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles ( name, avatar_url ),
        categories ( * ),
        listings_images ( * )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // "Not a single row was returned"
        return NextResponse.json({ message: 'Quarto não encontrado' }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: 'Quarto não encontrado' }, { status: 404 });
    }

    const listingDetail = mapToListingDetail(data);
    return NextResponse.json(listingDetail, { status: 200 });

  } catch (error: any) {
    console.error(`API Error fetching listing ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro ao buscar os detalhes do quarto', error: error.message }, { status: 500 });
  }
}
