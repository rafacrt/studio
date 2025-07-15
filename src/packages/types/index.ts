
import type { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  role?: string;
  status?: string;
  dateJoined?: string;
}

export interface ListingImage {
  id:string;
  url: string;
  alt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface UniversityArea {
  id: string;
  name: string;
  acronym: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  icon?: LucideIcon;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  images: ListingImage[];
  pricePerNight: number; // Represents monthly price
  address: string;
  lat: number;
  lng: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: Amenity[];
  rating: number;
  reviews: number;
  host: User;
  university: UniversityArea;
  isAvailable: boolean;
  type: string; // e.g., 'Quarto Individual', 'Kitnet', 'Vaga em República'
  cancellationPolicy: string;
  houseRules: string; // Can be a list of rules separated by newlines
  safetyAndProperty: string; // Can be a list of items separated by newlines
  category?: string; // Optional: to link with new categories
}

export interface Booking {
  id: string;
  listingId: string;
  listing: Listing; // Ensure listing object is part of Booking
  userId: string;
  user: User;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'Confirmada' | 'Pendente' | 'Cancelada' | 'Concluída';
  guests: number;
  bookedAt?: string; // Optional: date of booking
}

export interface ListingFilters {
  searchTerm?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  newUsers: number;
  pendingApprovals: number;
  activeBookings: number;
}

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string; // Optional description for the category
}

// Tipos para a funcionalidade de Mensagens
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string date
}

export interface ChatConversation {
  id: string;
  participants: User[]; // Array of users in the conversation (usually 2)
  lastMessage?: ChatMessage;
  unreadCount?: number;
}
