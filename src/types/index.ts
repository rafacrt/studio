
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  isAdmin?: boolean;
  status?: "Ativo" | "Inativo"; // Added for user management page
  dateJoined?: string; // Added for user management page
  role?: "Usuário" | "Admin" | "Anfitrião"; // Added for user management page
}

export interface Amenity {
  id: string;
  name: string;
  icon: React.ElementType; // Lucide icon component
}

export interface Review {
  id: string;
  userName: string;
  userAvatarUrl: string;
  rating: number;
  comment: string;
  date: string;
}

export type LatLngLiteral = {
  lat: number;
  lng: number;
};

export interface UniversityArea { // Added UniversityArea type
  city: string;
  name: string;
  acronym: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  images: string[];
  pricePerNight: number;
  rating: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  amenities: Amenity[];
  host: {
    name: string;
    avatarUrl: string;
  };
  reviews: Review[];
  type: string; // e.g. "Entire apartment", "Private room"
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  universityName: string;
  universityAcronym: string;
}

export type BookingStatus = 'active' | 'past' | 'cancelled';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
}

