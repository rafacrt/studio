import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Helper function to get the last message for a list of conversations
// The RPC function 'get_last_messages' should be created in Supabase.
async function getLastMessages(supabase: SupabaseClient, conversationIds: string[]) {
  if (conversationIds.length === 0) return new Map();
  
  const { data, error } = await supabase.rpc('get_last_messages', {
    p_conversation_ids: conversationIds
  });

  if (error) {
    console.error('Error fetching last messages with RPC:', error);
    return new Map();
  }
  
  const lastMessagesMap = new Map();
  if (data) {
    data.forEach((msg: any) => {
      lastMessagesMap.set(msg.conversation_id, msg);
    });
  }

  return lastMessagesMap;
}

// GET /api/messages/conversations
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 1. Get the IDs of conversations the user is in
    const { data: userConvoIds, error: idsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (idsError) throw idsError;
    if (!userConvoIds || userConvoIds.length === 0) {
        return NextResponse.json([], { status: 200 });
    }
    const conversationIds = userConvoIds.map(c => c.conversation_id);


    // 2. Fetch details for those conversations, including the other participants' profiles
    const { data: conversations, error: convosError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        listing_id,
        conversation_participants (
            profiles ( id, name, avatar_url )
        )
      `)
      .in('id', conversationIds);

    if (convosError) throw convosError;

    const lastMessagesMap = await getLastMessages(supabase, conversationIds);

    // 3. Format the final response
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.conversation_participants.find(p => p.profiles?.id !== user.id)?.profiles;
      const lastMessage = lastMessagesMap.get(conv.id);

      return {
        id: conv.id,
        listingId: conv.listing_id,
        createdAt: conv.created_at,
        otherParticipant: otherParticipant || null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.content,
          timestamp: lastMessage.created_at,
          senderId: lastMessage.sender_id,
        } : null,
      };
    }).sort((a, b) => {
        if (!a.lastMessage?.timestamp) return 1;
        if (!b.lastMessage?.timestamp) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    return NextResponse.json(formattedConversations, { status: 200 });

  } catch (error: any) {
    console.error('API Error fetching conversations:', error);
    return NextResponse.json({ message: 'Erro ao buscar conversas', error: error.message }, { status: 500 });
  }
}
