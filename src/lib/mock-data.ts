import type { Listing, Booking, User, Amenity, Review, LatLngLiteral } from '@/types';
import { Wifi, Tv, ParkingSquare, Utensils, Wind, Thermometer, Bath, Users, BedDouble, BookOpen, Briefcase, School } from 'lucide-react'; // Using BookOpen for Desk, Briefcase for Wardrobe, School for University
import { simulateApiCall } from '@/lib/utils';

export const mockUser: User = {
  id: 'user1',
  email: 'teste@exemplo.com',
  name: 'Alex Silva',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  isAdmin: false,
};

export const mockAdminUser: User = {
  id: 'admin1',
  email: 'admin@westudy.com',
  name: 'Admin WeStudy',
  avatarUrl: 'https://picsum.photos/seed/admin1/100/100',
  isAdmin: true,
};


const commonAmenities: Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'desk', name: 'Escrivaninha', icon: BookOpen },
  { id: 'wardrobe', name: 'Guarda-roupa', icon: Briefcase },
  { id: 'kitchen', name: 'Cozinha Compartilhada', icon: Utensils },
  { id: 'laundry', name: 'Lavanderia Compartilhada', icon: Wind },
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

export interface UniversityArea {
  city: string;
  name: string;
  acronym: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export const universityAreas: UniversityArea[] = [
  { city: "São Paulo", name: "Universidade de São Paulo", acronym: "USP", neighborhood: "Butantã", lat: -23.5595, lng: -46.7313 },
  { city: "Rio de Janeiro", name: "Universidade Federal do Rio de Janeiro", acronym: "UFRJ", neighborhood: "Urca", lat: -22.9523, lng: -43.1691 },
  { city: "Belo Horizonte", name: "Universidade Federal de Minas Gerais", acronym: "UFMG", neighborhood: "Pampulha", lat: -19.8593, lng: -43.9682 },
  { city: "Porto Alegre", name: "Universidade Federal do Rio Grande do Sul", acronym: "UFRGS", neighborhood: "Centro Histórico", lat: -30.0331, lng: -51.2302 },
  { city: "Recife", name: "Universidade Federal de Pernambuco", acronym: "UFPE", neighborhood: "Cidade Universitária", lat: -8.0476, lng: -34.9518 },
  { city: "Curitiba", name: "Universidade Federal do Paraná", acronym: "UFPR", neighborhood: "Jardim Botânico", lat: -25.4464, lng: -49.2398 },
  { city: "Campinas", name: "Universidade Estadual de Campinas", acronym: "Unicamp", neighborhood: "Barão Geraldo", lat: -22.8175, lng: -47.0699 },
  { city: "Salvador", name: "Universidade Federal da Bahia", acronym: "UFBA", neighborhood: "Federação", lat: -12.9935, lng: -38.5078 },
  { city: "Fortaleza", name: "Universidade Federal do Ceará", acronym: "UFC", neighborhood: "Benfica", lat: -3.7419, lng: -38.5428 },
];

export const mockListings: Listing[] = Array.from({ length: 9 }, (_, i) => {
  const areaInfo = universityAreas[i % universityAreas.length];
  // Slightly randomize listing location around the university for more realistic spread
  const latOffset = (Math.random() - 0.5) * 0.01; // approx +/- 550m
  const lngOffset = (Math.random() - 0.5) * 0.01; // approx +/- 550m

  return {
    id: `quarto${i + 1}`,
    title: `Quarto Universitário perto da ${areaInfo.acronym} em ${areaInfo.neighborhood}`,
    description: `Quarto individual mobiliado, ideal para estudantes da ${areaInfo.name} (${areaInfo.acronym}). Localizado em ${areaInfo.neighborhood}, ${areaInfo.city}. Ambiente tranquilo e seguro, com escrivaninha, cadeira confortável e internet de alta velocidade. Perfeito para focar nos estudos e aproveitar a vida universitária.`,
    images: [
      `https://picsum.photos/seed/quarto${i + 1}_1/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_2/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_3/800/450`,
      `https://picsum.photos/seed/quarto${i + 1}_4/800/450`,
    ],
    pricePerNight: 35 + i * 2, 
    rating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)), 
    location: {
      address: `Rua dos Estudantes, ${100 + i}, ${areaInfo.neighborhood}, ${areaInfo.city}, Próximo à ${areaInfo.acronym}`,
      lat: areaInfo.lat + latOffset, 
      lng: areaInfo.lng + lngOffset,
    },
    amenities: commonAmenities.sort(() => 0.5 - Math.random()).slice(0, 3 + (i % 4)),
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
    universityName: areaInfo.name,
    universityAcronym: areaInfo.acronym,
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
    endDate: '2024-12-20', 
    totalPrice: mockListings[0].pricePerNight * 30 * 4.5, 
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
export const fetchListings = async (page: number, limit: number = 9): Promise<Listing[]> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  // Ensure we don't go past the available mock listings if total is less than requested
  const listingsToShow = mockListings.slice(start, Math.min(end, mockListings.length));
  return simulateApiCall(listingsToShow);
};

export const fetchListingById = async (id: string): Promise<Listing | undefined> => {
  return simulateApiCall(mockListings.find(listing => listing.id === id));
};

export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  return simulateApiCall(mockBookings.filter(booking => booking.userId === userId));
};

// Mock data for admin dashboard
export const getAdminDashboardStats = async () => {
  return simulateApiCall({
    totalRevenue: 125430.50,
    newUsers: 78,
    pendingApprovals: 12,
    activeBookings: mockBookings.filter(b => b.status === 'active').length,
  });
};

export const getMonthlyRevenueData = async () => {
  return simulateApiCall([
    { month: "Jan", revenue: Math.floor(Math.random() * 5000) + 10000 },
    { month: "Fev", revenue: Math.floor(Math.random() * 5000) + 12000 },
    { month: "Mar", revenue: Math.floor(Math.random() * 5000) + 11000 },
    { month: "Abr", revenue: Math.floor(Math.random() * 5000) + 15000 },
    { month: "Mai", revenue: Math.floor(Math.random() * 5000) + 13000 },
    { month: "Jun", revenue: Math.floor(Math.random() * 5000) + 17000 },
  ]);
};

export const getBookingStatusData = async () => {
  return simulateApiCall([
    { status: "Ativas", count: mockBookings.filter(b => b.status === 'active').length, fill: "var(--color-active)" },
    { status: "Anteriores", count: mockBookings.filter(b => b.status === 'past').length, fill: "var(--color-past)" },
    { status: "Canceladas", count: mockBookings.filter(b => b.status === 'cancelled').length, fill: "var(--color-cancelled)" },
  ]);
};

export const getUniversityByAcronym = (acronym: string): UniversityArea | undefined => {
  return universityAreas.find(ua => ua.acronym === acronym);
};
