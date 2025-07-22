
import { NextResponse } from 'next/server';
import { createClient } from '@/packages/lib/supabase/server';

// GET /api/bookings - Busca o histórico de reservas do usuário
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Você precisa estar logado.' }, { status: 401 });
    }

    // Busca as reservas do usuário, incluindo os detalhes do quarto (listing) e suas imagens.
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings (
          *,
          listings_images ( url, alt ),
          profiles ( name, avatar_url )
        )
      `)
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Mapeia os dados do Supabase para o formato que o frontend espera
    const formattedBookings = bookings.map(booking => {
      if (!booking.listings) {
        return { ...booking, listing: null };
      }
      
      const { listings, ...restOfBooking } = booking;
      const { listings_images, profiles, ...restOfListing } = listings;

      const mappedListing = {
        ...restOfListing,
        pricePerNight: restOfListing.price_per_night, // Mapeia o nome do campo
        images: listings_images || [],
        host: profiles,
        university: { // Remonta o objeto university
          name: restOfListing.university_name,
          acronym: restOfListing.university_acronym,
          city: restOfListing.university_city,
        }
      };
      
      // Limpa campos que não são mais necessários no objeto aninhado
      delete (mappedListing as any).price_per_night;
      delete (mappedListing as any).university_name;
      delete (mappedListing as any).university_acronym;
      delete (mappedListing as any).university_city;
      delete (mappedListing as any).host_id;

      return {
        ...restOfBooking,
        listing: mappedListing
      };
    });

    return NextResponse.json(formattedBookings, { status: 200 });

  } catch (error: any) {
    console.error('API Error fetching bookings:', error);
    return NextResponse.json({ message: 'Erro ao buscar reservas', error: error.message }, { status: 500 });
  }
}

// POST /api/bookings - Cria uma nova reserva
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Você precisa estar logado para reservar.' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id, check_in_date, check_out_date, total_price, guests } = body;

    if (!listing_id || !check_in_date || !check_out_date || !total_price || !guests) {
      return NextResponse.json({ error: 'Informações de reserva incompletas.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        listing_id,
        user_id: user.id,
        check_in_date,
        check_out_date,
        total_price,
        guests,
        status: 'Confirmada' // Começa como confirmada para simplificar
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23503') { // Foreign key violation
          return NextResponse.json({ error: 'O quarto especificado não existe.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error('API Error creating booking:', error);
    return NextResponse.json({ message: 'Erro ao criar a reserva', error: error.message }, { status: 500 });
  }
}
