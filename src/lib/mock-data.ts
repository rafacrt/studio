import type { Listing, Booking, User, Amenity, Review } from '@/types';
import { Wifi, Tv, ParkingSquare, Utensils, Wind, Thermometer, Bath, Users, BedDouble, BookOpen, Briefcase } from 'lucide-react'; // Using BookOpen for Desk, Briefcase for Wardrobe

export const mockUser: User = {
  id: 'user1',
  email: 'teste@exemplo.com',
  name: 'Alex Silva',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};

const commonAmenities: Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'desk', name: 'Escrivaninha', icon: BookOpen }, // Changed to Desk
  { id: 'wardrobe', name: 'Guarda-roupa', icon: Briefcase }, // Added Wardrobe
  { id: 'kitchen', name: 'Cozinha Compartilhada', icon: Utensils },
  { id: 'laundry', name: 'Lavanderia Compartilhada', icon: Wind }, // Changed AC to Laundry
  { id: 'bathroom', name: 'Banheiro Privativo', icon: Bath },
];

const generateReviews = (listingId: string, count: number): Review[] => {
  const reviews: Review[] = [];
  const reviewComments = [
    "Excelente quarto para estudantes! Localização perfeita, perto da faculdade e com tudo que preciso. Recomendo!",
    "Muito bom! O quarto é confortável, a internet é rápida e o ambiente é tranquilo para estudar. Anfitrião atencioso.",
    "Adorei minha estadia. O quarto é exatamente como nas fotos, limpo e organizado. Ótimo custo-benefício para universitários.",
    "Localização privilegiada, fácil acesso ao transporte e restaurantes. O quarto tem uma boa escrivaninha para estudos.",
    "Recomendo fortemente! Ambiente seguro e ideal para quem precisa focar nos estudos. Voltarei com certeza."
  ];
  for (let i = 1; i <= count; i++) {
    reviews.push({
      id: `review-${listingId}-${i}`,
      userName: `Estudante ${i}`,
      userAvatarUrl: `https://picsum.photos/seed/reviewer${i}/50/50`,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: reviewComments[i % reviewComments.length],
      date: `2023-11-${String(10 + i).padStart(2, '0')}`,
    });
  }
  return reviews;
};

const universityAreas = [
  { city: "São Paulo", area: "Butantã (USP)", neighborhood: "Butantã" },
  { city: "Rio de Janeiro", area: "Urca (UFRJ)", neighborhood: "Urca" },
  { city: "Belo Horizonte", area: "Pampulha (UFMG)", neighborhood: "Pampulha" },
  { city: "Porto Alegre", area: "Centro (UFRGS)", neighborhood: "Centro Histórico" },
  { city: "Recife", area: "Cidade Universitária (UFPE)", neighborhood: "Cidade Universitária" },
  { city: "Curitiba", area: "Jardim Botânico (UFPR)", neighborhood: "Jardim Botânico" },
  { city: "Campinas", area: "Barão Geraldo (Unicamp)", neighborhood: "Barão Geraldo" },
];

export const mockListings: Listing[] = Array.from({ length: 36 }, (_, i) => {
  const areaInfo = universityAreas[i % universityAreas.length];
  return {
    id: `quarto${i + 1}`,
    title: `Quarto para Universitário em ${areaInfo.neighborhood}`,
    description: `Quarto individual mobiliado, ideal para estudantes. Localizado em ${areaInfo.neighborhood}, ${areaInfo.city}, próximo à ${areaInfo.area}. Ambiente tranquilo e seguro, com escrivaninha, cadeira confortável e internet de alta velocidade. Perfeito para focar nos estudos e aproveitar a vida universitária.`,
    images: [
      `https://picsum.photos/seed/quarto${i + 1}_1/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_2/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_3/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_4/800/450`,
    ],
    pricePerNight: 35 + i * 2, // Adjusted price for student rooms (per night, can be interpreted as daily rate for monthly calc)
    rating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)), // Between 4.3 and 5.0
    location: {
      address: `Rua dos Estudantes, ${100 + i}, ${areaInfo.neighborhood}, ${areaInfo.city}`,
      lat: -23.5505 + (i * 0.001), // Example Lat/Lng for São Paulo area
      lng: -46.6333 + (i * 0.001),
    },
    amenities: commonAmenities.sort(() => 0.5 - Math.random()).slice(0, 3 + (i % 4)), // Vary amenities
    host: {
      name: `Anfitrião ${String.fromCharCode(65 + (i % 26))}`, 
      avatarUrl: `https://picsum.photos/seed/host${i + 1}/80/80`,
    },
    reviews: generateReviews(`quarto${i + 1}`, 2 + (i % 4)),
    type: "Quarto para universitário",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
  };
});

export const mockBookings: Booking[] = [
  {
    id: 'reserva1',
    listingId: 'quarto1',
    listingTitle: mockListings[0].title,
    listingImage: mockListings[0].images[0],
    userId: 'user1',
    startDate: '2024-08-01',
    endDate: '2024-12-20', // Longer term for students
    totalPrice: mockListings[0].pricePerNight * 30 * 4.5, // Approximate monthly * duration
    status: 'active',
  },
  {
    id: 'reserva2',
    listingId: 'quarto3',
    listingTitle: mockListings[2].title,
    listingImage: mockListings[2].images[0],
    userId: 'user1',
    startDate: '2024-02-10',
    endDate: '2024-06-30',
    totalPrice: mockListings[2].pricePerNight * 30 * 4.5,
    status: 'past',
  },
  {
    id: 'reserva3',
    listingId: 'quarto5',
    listingTitle: mockListings[4].title,
    listingImage: mockListings[4].images[0],
    userId: 'user1',
    startDate: '2025-01-15',
    endDate: '2025-05-15',
    totalPrice: mockListings[4].pricePerNight * 30 * 4,
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
