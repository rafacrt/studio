
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatConversation, ChatMessage, User } from '@/types';
import { fetchUserConversations, fetchMessagesForConversation, sendMockMessage, loadMockMessagesFromStorage } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquareText, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Componente para um item da lista de conversas
interface ConversationListItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  currentUser: User | null;
}

function ConversationListItem({ conversation, isSelected, onSelect, currentUser }: ConversationListItemProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
  if (!otherParticipant) return null;

  const lastMessageText = conversation.lastMessage?.text || "Nenhuma mensagem ainda.";
  
  let lastMessageTimestamp = "";
  if (conversation.lastMessage?.timestamp) {
    const date = parseISO(conversation.lastMessage.timestamp);
    if (isToday(date)) {
      lastMessageTimestamp = format(date, "HH:mm", { locale: ptBR });
    } else if (isYesterday(date)) {
      lastMessageTimestamp = "Ontem";
    } else {
      lastMessageTimestamp = format(date, "dd/MM/yy", { locale: ptBR });
    }
  }


  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex items-center w-full p-3 text-left hover:bg-muted/50 transition-colors duration-150 rounded-lg",
        isSelected ? "bg-muted" : ""
      )}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
        <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-foreground truncate">{otherParticipant.name}</h3>
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{lastMessageTimestamp}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{lastMessageText}</p>
      </div>
      {conversation.unreadCount && conversation.unreadCount > 0 && !isSelected && (
        <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

// Componente para uma bolha de mensagem
interface ChatMessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
  senderUser?: User;
  showAvatar: boolean;
}

function ChatMessageBubble({ message, isSender, senderUser, showAvatar }: ChatMessageBubbleProps) {
  const alignmentClass = isSender ? "items-end" : "items-start";
  const bubbleClass = isSender
    ? "bg-primary text-primary-foreground rounded-br-none"
    : "bg-muted text-foreground rounded-bl-none";
  
  const timestamp = message.timestamp ? format(parseISO(message.timestamp), "HH:mm", { locale: ptBR }) : "";

  return (
    <div className={`flex w-full my-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-end max-w-[75%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isSender && senderUser && showAvatar && (
                <Avatar className="h-6 w-6 self-end mb-1 flex-shrink-0 mr-2">
                    <AvatarImage src={senderUser.avatarUrl} alt={senderUser.name} data-ai-hint="person avatar small" />
                    <AvatarFallback>{senderUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
             {!isSender && !showAvatar && <div className="w-8 flex-shrink-0 mr-2"></div>}
            <div className={`px-3 py-2 rounded-xl ${bubbleClass} shadow-sm`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                 <p className={`text-[10px] mt-1 ${isSender ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>{timestamp}</p>
            </div>
        </div>
    </div>
  );
}


export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user?.id) {
      setIsLoadingConversations(true);
      fetchUserConversations(user.id)
        .then(setConversations)
        .finally(() => setIsLoadingConversations(false));
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation?.id) {
      setIsLoadingMessages(true);
      // Mark conversation as read locally immediately
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? {...c, unreadCount: 0} : c));

      const loadedMessages = loadMockMessagesFromStorage(selectedConversation.id);
      setMessages(loadedMessages);
      setIsLoadingMessages(false);
      if (loadedMessages.length === 0) {
        // Simulate API fetch if localStorage is empty for this conversation
        fetchMessagesForConversation(selectedConversation.id)
          .then(setMessages)
          .finally(() => setIsLoadingMessages(false));
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);
  
  useEffect(() => {
    if(messages.length > 0) {
        // Using setTimeout to ensure scroll happens after DOM update
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // "auto" can be smoother for initial load
        }, 0);
    }
  }, [messages, selectedConversation]);


  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation || null);
    // Unread count update is handled in the useEffect for selectedConversation
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      conversationId: selectedConversation.id,
      senderId: user.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");

    // Ensure new message scrolls into view smoothly
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);


    try {
      const sentMessage = await sendMockMessage(selectedConversation.id, user.id, newMessage.trim());
      setMessages(prev => prev.map(m => m.id === tempMessageId ? sentMessage : m));
      // Update conversation list: move this conversation to top and update last message
      setConversations(prevConvs => {
        const updatedConv = prevConvs.find(c => c.id === selectedConversation.id);
        if (!updatedConv) return prevConvs;
        const otherConvs = prevConvs.filter(c => c.id !== selectedConversation.id);
        return [{...updatedConv, lastMessage: sentMessage, unreadCount: 0}, ...otherConvs];
      });

    } catch (error) {
      console.error("Falha ao enviar mensagem mockada:", error);
      setMessages(prev => prev.filter(m => m.id !== tempMessageId)); 
      // TODO: Add toast for send error
    }
  };
  
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== user?.id);

  return (
    <div className="flex h-[calc(100vh-var(--bottom-nav-height,4rem))] bg-background">
      {/* Sidebar de Conversas */}
      <aside className={cn(
        "border-r border-border flex flex-col",
        selectedConversation ? "hidden md:flex md:w-[320px] lg:w-[360px]" : "w-full md:flex md:w-[320px] lg:w-[360px]"
      )}>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Mensagens</h2>
        </div>
        <ScrollArea className="flex-grow p-2">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onSelect={handleSelectConversation}
                currentUser={user}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conversa encontrada.</p>
          )}
        </ScrollArea>
      </aside>

      {/* Área de Chat Principal */}
      <main className={cn(
        "flex flex-col bg-muted/20 flex-1", // Use flex-1 to take remaining space
        selectedConversation ? "flex" : "hidden md:flex"
      )}>
        {selectedConversation && otherParticipant ? (
          <>
            <header className="p-3 border-b border-border bg-background flex items-center shadow-sm h-[65px]">
              <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 mr-3">
                 <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar"/>
                 <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-foreground">{otherParticipant.name}</h2>
            </header>
            
            <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-1">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length > 0 ? (
                 messages.map((msg, index) => {
                    const prevMessage = messages[index-1];
                    const showAvatar = !msg.senderId || msg.senderId !== prevMessage?.senderId || !prevMessage;
                    return (
                        <ChatMessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isSender={msg.senderId === user?.id} 
                            senderUser={selectedConversation.participants.find(p => p.id === msg.senderId)}
                            showAvatar={showAvatar}
                        />
                    );
                 })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Envie uma mensagem para começar a conversa.</p>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-3 border-t border-border bg-background">
              <div className="flex items-center space-x-2 bg-muted rounded-full px-2">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage();}}}
                  className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11 placeholder:text-muted-foreground"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="icon" variant="ghost" className="text-primary hover:bg-primary/10 rounded-full h-9 w-9">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <MessageSquareText className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Selecione uma conversa</h2>
            <p className="text-muted-foreground">Ou comece uma nova para ver as mensagens aqui.</p>
          </div>
        )}
      </main>
      <style jsx global>{`
        :root {
          --bottom-nav-height: 4rem; /* Adjust if your bottom nav height changes */
        }
        @media (min-width: 768px) { /* md breakpoint */
          :root {
            --bottom-nav-height: 0rem; /* No bottom nav on larger screens */
          }
        }
        body {
          overflow: hidden; /* Prevent body scroll when chat is active */
        }
      `}</style>
    </div>
  );
}

