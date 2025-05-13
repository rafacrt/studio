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

export interface Image {
  id: string;
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
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  images: Image[];
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
}

export interface Booking {
  id: string;
  listingId: string;
  listing: Listing;
  userId: string;
  user: User;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'Confirmada' | 'Pendente' | 'Cancelada' | 'Concluída';
  guests: number;
}

export interface ListingFilters {
  searchTerm?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  // Add other potential filters like amenities, number of bedrooms, etc.
}

export interface AdminDashboardStats {
  totalRevenue: number;
  newUsers: number;
  pendingApprovals: number;
  activeBookings: number;
}
