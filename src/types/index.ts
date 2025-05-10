export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
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
