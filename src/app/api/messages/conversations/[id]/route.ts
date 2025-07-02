import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/messages/conversations/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id;
    if (!conversationId) {
      return NextResponse.json({ error: 'ID da conversa é obrigatório.' }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Verify user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Acesso negado a esta conversa.' }, { status: 403 });
    }

    // Fetch messages for the conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.content,
      timestamp: msg.created_at,
      senderId: msg.sender_id
    }));


    return NextResponse.json(formattedMessages, { status: 200 });

  } catch (error: any) {
    console.error(`API Error fetching messages for conversation ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro ao buscar mensagens', error: error.message }, { status: 500 });
  }
}


// POST /api/messages/conversations/[id]
export async function POST(request: Request, { params }: { params: { id:string } }) {
  try {
    const conversationId = params.id;
    if (!conversationId) {
      return NextResponse.json({ error: 'ID da conversa é obrigatório.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Verify user is a participant
    const { count: participantCount, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (participantError || participantCount === 0) {
      return NextResponse.json({ error: 'Acesso negado para enviar mensagem nesta conversa.' }, { status: 403 });
    }
    
    const { content } = await request.json();
    if (!content || typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json({ error: 'O conteúdo da mensagem não pode ser vazio.' }, { status: 400 });
    }
    
    // Insert the new message
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    //TODO: Enviar notificação push para o outro participante

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    console.error(`API Error sending message to conversation ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro ao enviar mensagem', error: error.message }, { status: 500 });
  }
}
