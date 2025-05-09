import type { Listing, Booking, User, Amenity, Review } from '@/types';
import { Wifi, Tv, ParkingSquare, Utensils, Wind, Thermometer, Bath, Users, BedDouble, Sofa, MapPin, Star } from 'lucide-react';

export const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};

const commonAmenities: Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'parking', name: 'Free Parking', icon: ParkingSquare },
  { id: 'kitchen', name: 'Kitchen', icon: Utensils },
  { id: 'ac', name: 'Air Conditioning', icon: Wind },
  { id: 'heating', name: 'Heating', icon: Thermometer },
];

const generateReviews = (listingId: string, count: number): Review[] => {
  const reviews: Review[] = [];
  for (let i = 1; i <= count; i++) {
    reviews.push({
      id: `review-${listingId}-${i}`,
      userName: `User ${i}`,
      userAvatarUrl: `https://picsum.photos/seed/reviewer${i}/50/50`,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: `This place was amazing! Highly recommend. The host was very responsive and the location was perfect. Amenities were great too. Enjoyed my stay very much. Will come back!`,
      date: `2023-10-${String(10 + i).padStart(2, '0')}`,
    });
  }
  return reviews;
};

export const mockListings: Listing[] = Array.from({ length: 36 }, (_, i) => ({
  id: `listing${i + 1}`,
  title: `Cozy Apartment in Downtown ${i + 1}`,
  description: `A beautiful and spacious apartment located in the heart of the city. Perfect for couples or solo travelers. Enjoy the vibrant city life with easy access to attractions, restaurants, and public transport. This is a longer description to test multi-line capabilities and text truncation. It should ideally wrap up to three lines.`,
  images: [
    `https://picsum.photos/seed/img${i + 1}_1/800/450`,
    `https://picsum.photos/seed/img${i + 1}_2/800/450`,
    `https://picsum.photos/seed/img${i + 1}_3/800/450`,
    `https://picsum.photos/seed/img${i + 1}_4/800/450`,
  ],
  pricePerNight: 75 + i * 5,
  rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)), // Between 4.5 and 5.0
  location: {
    address: `${123 + i} Main St, Anytown, USA`,
    lat: 34.0522 + (i * 0.01),
    lng: -118.2437 + (i * 0.01),
  },
  amenities: commonAmenities.slice(0, 4 + (i % 3)), // Vary number of amenities
  host: {
    name: `Host ${String.fromCharCode(65 + (i % 26))}`, // A, B, C...
    avatarUrl: `https://picsum.photos/seed/host${i + 1}/80/80`,
  },
  reviews: generateReviews(`listing${i + 1}`, 3 + (i % 5)),
  type: i % 2 === 0 ? "Entire apartment" : "Private room",
  guests: 2 + (i % 3), // 2, 3 or 4 guests
  bedrooms: 1 + (i % 2), // 1 or 2 bedrooms
  beds: 1 + (i % 2), // 1 or 2 beds
  baths: 1,
}));

export const mockBookings: Booking[] = [
  {
    id: 'booking1',
    listingId: 'listing1',
    listingTitle: mockListings[0].title,
    listingImage: mockListings[0].images[0],
    userId: 'user1',
    startDate: '2024-08-15',
    endDate: '2024-08-20',
    totalPrice: mockListings[0].pricePerNight * 5,
    status: 'active',
  },
  {
    id: 'booking2',
    listingId: 'listing3',
    listingTitle: mockListings[2].title,
    listingImage: mockListings[2].images[0],
    userId: 'user1',
    startDate: '2024-07-01',
    endDate: '2024-07-05',
    totalPrice: mockListings[2].pricePerNight * 4,
    status: 'past',
  },
  {
    id: 'booking3',
    listingId: 'listing5',
    listingTitle: mockListings[4].title,
    listingImage: mockListings[4].images[0],
    userId: 'user1',
    startDate: '2024-09-01',
    endDate: '2024-09-03',
    totalPrice: mockListings[4].pricePerNight * 2,
    status: 'active',
  },
];

// API simulation functions
export const fetchListings = async (page: number, limit: number = 12): Promise<Listing[]> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return simulateApiCall(mockListings.slice(start, end));
};

export const fetchListingById = async (id: string): Promise<Listing | undefined> => {
  return simulateApiCall(mockListings.find(listing => listing.id === id));
};

export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  return simulateApiCall(mockBookings.filter(booking => booking.userId === userId));
};
