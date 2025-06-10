
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatConversation, ChatMessage, User } from '@/types';
import { fetchUserConversations, fetchMessagesForConversation, sendMockMessage, loadMockMessagesFromStorage } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquareText, ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { format, parseISO, isToday, isYesterday, formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

  const lastMessageText = conversation.lastMessage?.text ?
    (conversation.lastMessage.senderId === currentUser?.id ? "Você: " : "") + conversation.lastMessage.text
    : "Nenhuma mensagem ainda.";

  let lastMessageTimestamp = "";
  if (conversation.lastMessage?.timestamp) {
    try {
      const date = parseISO(conversation.lastMessage.timestamp);
      if (date instanceof Date && !isNaN(date.valueOf())) {
        if (isToday(date)) {
          lastMessageTimestamp = format(date, "HH:mm", { locale: ptBR });
        } else if (isYesterday(date)) {
          lastMessageTimestamp = "Ontem";
        } else {
          lastMessageTimestamp = formatRelative(date, new Date(), { locale: ptBR }).split(' ')[0]; 
          if (!["Ontem", "Hoje"].includes(lastMessageTimestamp) && !lastMessageTimestamp.includes(":")) {
             lastMessageTimestamp = format(date, "dd/MM", { locale: ptBR });
          }
        }
      } else {
        lastMessageTimestamp = "Data Inv.";
      }
    } catch (e) {
      console.error("Error formatting conversation timestamp:", e);
      lastMessageTimestamp = "Erro Data";
    }
  }

  const mockStatus = Math.random() > 0.5 ? "Confirmada" : "Pendente";
  const mockDateRange = "7-8 de jun.";
  const mockIdentifier = conversation.id.slice(-5); 

  const roomImageUrl = `https://placehold.co/100x100.png?text=${mockIdentifier}`;

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex items-start w-full p-4 text-left hover:bg-muted/30 transition-colors duration-150",
        isSelected ? "bg-muted/50" : ""
      )}
    >
      <div className="relative w-14 h-14 mr-3 flex-shrink-0">
        <Image
          src={roomImageUrl}
          alt={`Quarto da conversa com ${otherParticipant.name}`}
          width={56}
          height={56}
          className="rounded-lg object-cover w-full h-full"
          data-ai-hint="listing room small"
        />
        <Avatar className="absolute -bottom-1 -right-1 h-7 w-7 border-2 border-background">
          <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar small conversation" />
          <AvatarFallback className="text-xs bg-foreground text-background font-semibold">
            {otherParticipant.name ? otherParticipant.name.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-baseline">
          <h3 className="text-md font-semibold text-foreground truncate">{otherParticipant.name}</h3>
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{lastMessageTimestamp}</p>
          )}
        </div>
        <p className={cn("text-sm truncate mt-0.5", conversation.unreadCount && !isSelected && conversation.lastMessage?.senderId !== currentUser?.id ? "text-foreground font-medium" : "text-muted-foreground")}>{lastMessageText}</p>
        <div className="text-xs text-muted-foreground/80 mt-1 flex items-center">
          {mockStatus === "Confirmada" && <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></span>}
          <span>{mockStatus}</span>
          <span className="mx-1">·</span>
          <span>{mockDateRange}</span>
          <span className="mx-1">·</span>
          <span>{mockIdentifier}</span>
        </div>
      </div>
    </button>
  );
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
  senderUser?: User;
  showAvatar: boolean;
}

function ChatMessageBubble({ message, isSender, senderUser, showAvatar }: ChatMessageBubbleProps) {
  const bubbleClass = isSender
    ? "bg-primary text-primary-foreground rounded-br-none self-end"
    : "bg-muted text-foreground rounded-bl-none self-start";

  let formattedTimestamp = "";
  if (message.timestamp) {
    try {
      const dateObj = parseISO(message.timestamp);
      if (dateObj instanceof Date && !isNaN(dateObj.valueOf())) { // Check if date is valid
        formattedTimestamp = format(dateObj, "HH:mm", { locale: ptBR });
      } else {
        formattedTimestamp = "Hora Inv."; // Fallback for invalid date
      }
    } catch (e) {
      console.error("Error formatting message timestamp:", e);
      formattedTimestamp = "Erro"; // Fallback for error
    }
  }

  return (
    <div className={`flex w-full my-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end max-w-[75%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isSender && senderUser && showAvatar && (
          <Avatar className="h-6 w-6 self-end mb-1 flex-shrink-0 mr-2">
            <AvatarImage src={senderUser.avatarUrl} alt={senderUser.name} data-ai-hint="person avatar message" />
            <AvatarFallback className="text-xs">{senderUser.name ? senderUser.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
        )}
        {!isSender && !showAvatar && <div className="w-8 flex-shrink-0 mr-2"></div>} 
        <div className={`px-3 py-2 rounded-xl ${bubbleClass} shadow-sm`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          {formattedTimestamp && (
            <p className={`text-[10px] mt-1 ${isSender ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>{formattedTimestamp}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const messageFilters = ["Todas", "Sou anfitrião", "Sou hóspede", "Coanfitriã"];


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
  const [activeFilter, setActiveFilter] = useState("Todas");

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);


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
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c));

      const loadedMessages = loadMockMessagesFromStorage(selectedConversation.id);
      setMessages(loadedMessages);
      setIsLoadingMessages(false);
      
      if (loadedMessages.length === 0) {
        fetchMessagesForConversation(selectedConversation.id)
          .then(setMessages)
          .finally(() => setIsLoadingMessages(false));
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [messages, selectedConversation]);


  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation || null);
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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);


    try {
      const sentMessage = await sendMockMessage(selectedConversation.id, user.id, newMessage.trim());
      setMessages(prev => prev.map(m => m.id === tempMessageId ? sentMessage : m));
      
      setConversations(prevConvs => {
        const updatedConv = prevConvs.find(c => c.id === selectedConversation.id);
        if (!updatedConv) return prevConvs;
        const otherConvs = prevConvs.filter(c => c.id !== selectedConversation.id);
        return [{ ...updatedConv, lastMessage: sentMessage, unreadCount: 0 }, ...otherConvs];
      });

    } catch (error) {
      console.error("Falha ao enviar mensagem mockada:", error);
      setMessages(prev => prev.filter(m => m.id !== tempMessageId));
    }
  };

  const otherParticipant = selectedConversation?.participants.find(p => p.id !== user?.id);

  return (
    <div className="flex h-[calc(100vh-var(--bottom-nav-height,4rem))] bg-background">
      <aside className={cn(
        "border-r border-border flex flex-col",
        selectedConversation ? "hidden md:flex md:w-[420px] lg:w-[460px]" : "w-full md:flex md:w-[420px] lg:w-[460px]"
      )}>
        <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <ScrollArea className="pb-1 -mx-4 px-4">
            <div className="flex space-x-2">
              {messageFilters.map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm h-auto",
                    activeFilter === filter ? "bg-foreground text-background hover:bg-foreground/90" : "bg-muted/60 border-border hover:bg-muted text-foreground"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <ScrollArea className="flex-grow">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center h-full py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : conversations.length > 0 ? (
            <div className="divide-y divide-border">
              {conversations.map(conv => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversation?.id === conv.id}
                  onSelect={handleSelectConversation}
                  currentUser={user}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Nenhuma conversa encontrada.</p>
          )}
        </ScrollArea>
      </aside>

      <main className={cn(
        "flex flex-col bg-muted/20 flex-1",
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
                <AvatarFallback>{otherParticipant.name ? otherParticipant.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
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
                  const prevMessage = messages[index - 1];
                  const isMsgSenderCurrentUser = msg.senderId === user?.id;
                  const showAvatarForThisMessage = !isMsgSenderCurrentUser && (!prevMessage || prevMessage.senderId !== msg.senderId || isMsgSenderCurrentUser);
                  
                  return (
                    <ChatMessageBubble
                      key={msg.id}
                      message={msg}
                      isSender={isMsgSenderCurrentUser}
                      senderUser={selectedConversation.participants.find(p => p.id === msg.senderId)}
                      showAvatar={showAvatarForThisMessage}
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
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
    </div>
  );
}

