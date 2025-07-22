
import { NextResponse } from 'next/server';
import { createClient } from '@/packages/lib/supabase/server';

// POST /api/bookings/[id]/unlock
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json({ error: 'ID da reserva é obrigatório.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Verifica se a reserva pertence ao usuário que está tentando destrancar
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('user_id, status')
      .eq('id', bookingId)
      .single();
      
    if (bookingError || !booking) {
        return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
        // O usuário está tentando destrancar uma reserva que não é dele
        return NextResponse.json({ error: 'Proibido. Você não tem permissão para esta reserva.' }, { status: 403 });
    }

    // Verifica se a reserva está ativa
    const allowedStatus = ['Confirmada', 'confirmed'];
    if (!allowedStatus.includes(booking.status)) {
        return NextResponse.json({ error: `Não é possível destrancar uma reserva com status: ${booking.status}`}, { status: 403 });
    }

    // --- LÓGICA DE DESTRANCAMENTO (MOCK) ---
    // Em um cenário real, você faria a interface com a API de uma fechadura inteligente aqui.
    console.log(`Usuário ${user.id} está destrancando a porta para a reserva ${bookingId}`);
    
    // Simula um atraso para o processo de destrancamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ success: true, message: `Porta para a reserva ${bookingId} destrancada com sucesso.` }, { status: 200 });

  } catch (error: any) {
    console.error(`API Error unlocking door for booking ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro ao destrancar a porta', error: error.message }, { status: 500 });
  }
}
