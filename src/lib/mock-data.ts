import type { Listing, User, Booking, Amenity, UniversityArea, ListingFilters, AdminDashboardStats } from '@/types';
import { Bed, Wifi, Tv, Utensils, Snowflake, Car, Bath, Dumbbell, WashingMachine, Trees, LampDesk, CheckSquare } from 'lucide-react';
import { mockUser, mockAdminUser } from './auth-mocks'; // Using centralized mocks

// Helper function to simulate API call delay
const simulateApiCall = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => { // NO REJECT for mocks, they always succeed
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};


export const commonAmenities: Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'kitchen', name: 'Cozinha Equipada', icon: Utensils },
  { id: 'ac', name: 'Ar Condicionado', icon: Snowflake },
  { id: 'parking', name: 'Estacionamento', icon: Car },
  { id: 'privBathroom', name: 'Banheiro Privativo', icon: Bath },
  { id: 'gym', name: 'Academia', icon: Dumbbell },
  { id: 'laundry', name: 'Lavanderia', icon: WashingMachine },
  { id: 'studyArea', name: 'Área de Estudos', icon: LampDesk },
  { id: 'commonArea', name: 'Área Comum', icon: Trees },
  { id: 'allBillsIncluded', name: 'Contas Inclusas', icon: CheckSquare },
];

export const universityAreas: UniversityArea[] = [
  { id: 'usp-butanta', name: 'Universidade de São Paulo', acronym: 'USP', city: 'São Paulo', neighborhood: 'Butantã', lat: -23.5595, lng: -46.7313 },
  { id: 'unicamp-barao', name: 'Universidade Estadual de Campinas', acronym: 'Unicamp', city: 'Campinas', neighborhood: 'Barão Geraldo', lat: -22.8178, lng: -47.0687 },
  { id: 'ufmg-pampulha', name: 'Universidade Federal de Minas Gerais', acronym: 'UFMG', city: 'Belo Horizonte', neighborhood: 'Pampulha', lat: -19.8665, lng: -43.9607 },
  { id: 'puc-rio', name: 'Pontifícia Universidade Católica do Rio de Janeiro', acronym: 'PUC-Rio', city: 'Rio de Janeiro', neighborhood: 'Gávea', lat: -22.9777, lng: -43.2331 },
  { id: 'ufsc-trindade', name: 'Universidade Federal de Santa Catarina', acronym: 'UFSC', city: 'Florianópolis', neighborhood: 'Trindade', lat: -27.5999, lng: -48.5172 },
];

const getUniversityByAcronym = (acronym: string): UniversityArea | undefined => {
    return universityAreas.find(uni => uni.acronym === acronym);
}

// Initial Mock Listings (fewer, as requested)
let mockListings: Listing[] = [
  {
    id: 'quarto1',
    title: 'Quarto Aconchegante Próximo à USP',
    description: 'Quarto individual mobiliado, ideal para estudantes da USP. Ambiente tranquilo e seguro, com área de estudos e internet de alta velocidade. Contas inclusas.',
    images: [
      { id: 'img1', url: 'https://picsum.photos/seed/quarto1-1/600/400' , alt: 'Vista do quarto aconchegante'},
      { id: 'img2', url: 'https://picsum.photos/seed/quarto1-2/600/400' , alt: 'Área de estudos do quarto'},
      { id: 'img3', url: 'https://picsum.photos/seed/quarto1-3/600/400' , alt: 'Banheiro privativo do quarto'},
    ],
    pricePerNight: 1200, // Price per month
    address: 'Rua do Matão, 1010, Butantã, São Paulo - SP',
    lat: -23.5580,
    lng: -46.7250,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[2], commonAmenities[8], commonAmenities[10]],
    rating: 4.8,
    reviews: 45,
    host: mockAdminUser, // Changed host to mockAdminUser
    university: getUniversityByAcronym('USP')!,
    isAvailable: true,
    type: 'Quarto Individual',
  },
  {
    id: 'quarto2',
    title: 'Kitnet Completa na Unicamp',
    description: 'Kitnet para uma pessoa, totalmente equipada, a poucos minutos da Unicamp. Inclui cozinha compacta, banheiro privativo e Wi-Fi. Perfeito para quem busca praticidade.',
    images: [
      { id: 'img4', url: 'https://picsum.photos/seed/quarto2-1/600/400' , alt: 'Visão geral da kitnet'},
      { id: 'img5', url: 'https://picsum.photos/seed/quarto2-2/600/400' , alt: 'Cozinha compacta da kitnet'},
    ],
    pricePerNight: 950,
    address: 'Av. Albino J. B. de Oliveira, 1500, Barão Geraldo, Campinas - SP',
    lat: -22.8145,
    lng: -47.0700,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[5]],
    rating: 4.5,
    reviews: 30,
    host: mockAdminUser,
    university: getUniversityByAcronym('Unicamp')!,
    isAvailable: false,
    type: 'Kitnet',
  },
  {
    id: 'quarto3',
    title: 'Vaga em República perto da UFMG',
    description: 'Vaga em quarto compartilhado em república estudantil bem localizada na Pampulha, próxima à UFMG. Casa com ótima infraestrutura, incluindo lavanderia e área comum.',
    images: [
      { id: 'img6', url: 'https://picsum.photos/seed/quarto3-1/600/400', alt: 'Quarto compartilhado na república' },
      { id: 'img7', url: 'https://picsum.photos/seed/quarto3-2/600/400', alt: 'Área comum da república' },
    ],
    pricePerNight: 700,
    address: 'Rua Prof. Baeta Viana, 200, Pampulha, Belo Horizonte - MG',
    lat: -19.8690,
    lng: -43.9630,
    guests: 1, // Vaga individual em quarto compartilhado
    bedrooms: 1, // Refere-se ao quarto específico
    beds: 1,
    baths: 2, // Banheiros compartilhados na casa
    amenities: [commonAmenities[0], commonAmenities[7], commonAmenities[9]],
    rating: 4.2,
    reviews: 22,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFMG')!,
    isAvailable: true,
    type: 'Vaga em República',
  },
  {
    id: 'quarto4',
    title: 'Studio Moderno na Gávea (PUC-Rio)',
    description: 'Studio elegante e funcional, perfeito para estudantes da PUC-Rio. Totalmente mobiliado, com design moderno, ar condicionado e cozinha americana. Prédio com portaria 24h.',
    images: [
      { id: 'img8', url: 'https://picsum.photos/seed/quarto4-1/600/400', alt: 'Interior do studio moderno' },
      { id: 'img9', url: 'https://picsum.photos/seed/quarto4-2/600/400', alt: 'Detalhe da cozinha americana' },
    ],
    pricePerNight: 1500,
    address: 'Rua Marquês de São Vicente, 225, Gávea, Rio de Janeiro - RJ',
    lat: -22.9750,
    lng: -43.2300,
    guests: 1,
    bedrooms: 0, // Studio
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[3], commonAmenities[5]],
    rating: 4.9,
    reviews: 55,
    host: mockAdminUser,
    university: getUniversityByAcronym('PUC-Rio')!,
    isAvailable: true,
    type: 'Studio',
  },
  {
    id: 'quarto5',
    title: 'Quarto Amplo com Varanda (UFSC)',
    description: 'Quarto espaçoso em apartamento compartilhado, com varanda privativa e vista para área verde. Localizado no coração da Trindade, ideal para alunos da UFSC.',
    images: [
      { id: 'img10', url: 'https://picsum.photos/seed/quarto5-1/600/400', alt: 'Quarto amplo com acesso à varanda' },
      { id: 'img11', url: 'https://picsum.photos/seed/quarto5-2/600/400', alt: 'Vista da varanda privativa' },
    ],
    pricePerNight: 1100,
    address: 'Rua Lauro Linhares, 1000, Trindade, Florianópolis - SC',
    lat: -27.6015,
    lng: -48.5190,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, // Banheiro compartilhado no apto
    amenities: [commonAmenities[0], commonAmenities[8], commonAmenities[9], commonAmenities[6]], // Added gym
    rating: 4.7,
    reviews: 38,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFSC')!,
    isAvailable: false,
    type: 'Quarto em Apartamento',
  },
  {
    id: 'quarto6',
    title: 'Quarto Econômico USP Leste',
    description: 'Opção mais em conta para estudantes da USP Leste. Quarto simples, funcional, em casa de família. Ambiente seguro e acolhedor.',
    images: [
      { id: 'img12', url: 'https://picsum.photos/seed/quarto6-1/600/400', alt: 'Quarto simples e funcional' },
    ],
    pricePerNight: 650,
    address: 'Av. Arlindo Béttio, 1000, Ermelino Matarazzo, São Paulo - SP',
    lat: -23.5000, // Approximate coordinates for USP Leste area
    lng: -46.4800,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, // Shared
    amenities: [commonAmenities[0]],
    rating: 4.0,
    reviews: 15,
    host: mockAdminUser,
    university: getUniversityByAcronym('USP')!, // Associating with main USP for simplicity, can create USP Leste entry
    isAvailable: true,
    type: 'Quarto Econômico',
  },
  {
    id: 'quarto7',
    title: 'Suíte Privativa Unicamp (Moradia Estudantil)',
    description: 'Suíte individual em moradia estudantil organizada, próxima à Unicamp. Comodidades incluem cozinha compartilhada e lavanderia. Ideal para foco nos estudos.',
    images: [
      { id: 'img13', url: 'https://picsum.photos/seed/quarto7-1/600/400', alt: 'Suíte privativa mobiliada' },
      { id: 'img14', url: 'https://picsum.photos/seed/quarto7-2/600/400', alt: 'Banheiro da suíte' },
    ],
    pricePerNight: 1050,
    address: 'Rua Bertrand Russell, 500, Barão Geraldo, Campinas - SP',
    lat: -22.8200,
    lng: -47.0650,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, // Privativo
    amenities: [commonAmenities[0], commonAmenities[5], commonAmenities[7], commonAmenities[8]],
    rating: 4.6,
    reviews: 28,
    host: mockAdminUser,
    university: getUniversityByAcronym('Unicamp')!,
    isAvailable: true,
    type: 'Suíte',
  },
  {
    id: 'quarto8',
    title: 'Quarto com Vista para Lagoa (UFMG)',
    description: 'Quarto em apartamento com vista espetacular para a Lagoa da Pampulha. Perto da UFMG, ideal para quem gosta de natureza e tranquilidade. Mobiliado e com Wi-Fi.',
    images: [
      { id: 'img15', url: 'https://picsum.photos/seed/quarto8-1/600/400', alt: 'Quarto com vista para a lagoa' },
    ],
    pricePerNight: 900,
    address: 'Av. Otacílio Negrão de Lima, 16000, Pampulha, Belo Horizonte - MG',
    lat: -19.8550,
    lng: -43.9700,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, // Shared
    amenities: [commonAmenities[0], commonAmenities[2], commonAmenities[9]],
    rating: 4.3,
    reviews: 19,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFMG')!,
    isAvailable: true,
    type: 'Quarto com Vista',
  },
  {
    id: 'quarto9',
    title: 'Apartamento Completo 2 Quartos (PUC-Rio)',
    description: 'Apartamento de 2 quartos na Gávea, ideal para dividir com um amigo. Totalmente mobiliado, próximo à PUC-Rio e comércio local. Contas não inclusas.',
    images: [
      { id: 'img16', url: 'https://picsum.photos/seed/quarto9-1/600/400', alt: 'Sala de estar do apartamento' },
      { id: 'img17', url: 'https://picsum.photos/seed/quarto9-2/600/400', alt: 'Um dos quartos do apartamento' },
    ],
    pricePerNight: 2800, // Price for the whole apartment
    address: 'Rua Artur Araripe, 100, Gávea, Rio de Janeiro - RJ',
    lat: -22.9790,
    lng: -43.2350,
    guests: 2,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[3], commonAmenities[7]],
    rating: 4.7,
    reviews: 40,
    host: mockAdminUser,
    university: getUniversityByAcronym('PUC-Rio')!,
    isAvailable: true,
    type: 'Apartamento 2 Quartos',
  },
];

let mockBookings: Booking[] = [
  {
    id: 'booking1',
    listingId: 'quarto2',
    listing: mockListings.find(l => l.id === 'quarto2')!,
    userId: mockUser.id,
    user: mockUser,
    checkInDate: '2024-08-01',
    checkOutDate: '2024-12-15',
    totalPrice: mockListings.find(l => l.id === 'quarto2')!.pricePerNight * 4.5, // Approx 4.5 months
    status: 'Confirmada',
    guests: 1,
  },
  {
    id: 'booking2',
    listingId: 'quarto5',
    listing: mockListings.find(l => l.id === 'quarto5')!,
    userId: mockUser.id,
    user: mockUser,
    checkInDate: '2024-03-01',
    checkOutDate: '2024-07-15',
    totalPrice: mockListings.find(l => l.id === 'quarto5')!.pricePerNight * 4.5,
    status: 'Concluída',
    guests: 1,
  },
];


export const fetchListings = async (page: number, limit: number, filters: ListingFilters): Promise<Listing[]> => {
  try {
    let filtered = mockListings.filter(listing => {
      if (!listing) return false; 

      if (filters.university) {
        if (!listing.university || typeof listing.university.acronym !== 'string' || listing.university.acronym !== filters.university) {
          return false;
        }
      }
      if (filters.minPrice !== undefined && (typeof listing.pricePerNight !== 'number' || listing.pricePerNight < filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice !== undefined && (typeof listing.pricePerNight !== 'number' || listing.pricePerNight > filters.maxPrice)) {
        return false;
      }
      if (filters.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const titleMatch = listing.title && typeof listing.title === 'string' && listing.title.toLowerCase().includes(searchTermLower);
        const addressMatch = listing.address && typeof listing.address === 'string' && listing.address.toLowerCase().includes(searchTermLower);
        if (!titleMatch && !addressMatch) {
          return false;
        }
      }
      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);
    return simulateApiCall(paginatedData);
  } catch (error) {
    console.error("Error during fetchListings filtering/slicing:", error);
    return simulateApiCall([]); // Return empty array on error to prevent breaking caller
  }
};

export const getRoomById = async (id: string): Promise<Listing | undefined> => {
 try {
    const room = mockListings.find(listing => listing.id === id);
    return simulateApiCall(room);
  } catch (error) {
    console.error("Error in getRoomById:", error);
    return simulateApiCall(undefined); // Return undefined on error
  }
};

export const bookMockRoom = async (listingId: string, userId: string, checkInDate: string, checkOutDate: string, guests: number): Promise<Booking> => {
  try {
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing) {
      throw new Error("Quarto não encontrado para reserva.");
    }
    if (!listing.isAvailable) {
      throw new Error("Este quarto não está mais disponível.");
    }

    // Mark listing as unavailable for simplicity in this mock
    listing.isAvailable = false; 

    const newBooking: Booking = {
      id: `booking${Date.now()}${Math.random().toString(16).slice(2)}`,
      listingId,
      listing,
      userId,
      user: mockUser, // Assuming current user is mockUser
      checkInDate,
      checkOutDate,
      // Simplified price calculation for mock
      totalPrice: listing.pricePerNight * 30, // Assuming a month's rent for simplicity
      status: 'Confirmada',
      guests,
    };
    mockBookings.push(newBooking);
    return simulateApiCall(newBooking, 1000); // Simulate longer delay for booking
  } catch (error) {
    console.error("Error in bookMockRoom:", error);
    // For the caller, we need to return a Promise that rejects or an object indicating failure.
    // Here, we rethrow so the caller's catch block can handle it.
    // To ensure it's a promise that's returned even on throw before simulateApiCall:
    return Promise.reject(error); 
  }
};

export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const userBookings = mockBookings.filter(booking => booking.userId === userId);
    return simulateApiCall(userBookings);
  } catch (error) {
    console.error("Error in fetchUserBookings:", error);
    return simulateApiCall([]);
  }
};

export const addMockListing = async (newListingData: Omit<Listing, 'id' | 'rating' | 'reviews' | 'host' | 'amenities' | 'images'> & { imageUrls: string[], selectedAmenityIds: string[], universityAcronym: string }): Promise<Listing> => {
  try {
    await simulateApiCall(null, 300); // Simulate delay for "API call"
    const newId = `quarto${mockListings.length + 1}${Date.now().toString().slice(-4)}`;
    const images = newListingData.imageUrls.map((url, index) => ({ id: `img${newId}-${index}`, url, alt: `${newListingData.title} - Imagem ${index + 1}` }));
    
    const selectedAmenities = commonAmenities.filter(amenity => newListingData.selectedAmenityIds.includes(amenity.id));

    const universityDetails = universityAreas.find(uni => uni.acronym === newListingData.universityAcronym);
    if (!universityDetails) {
      console.warn(`University with acronym ${newListingData.universityAcronym} not found. Defaulting.`);
    }


    const newListing: Listing = {
      id: newId,
      title: newListingData.title,
      description: newListingData.description,
      images: images,
      pricePerNight: newListingData.pricePerNight,
      address: newListingData.address,
      lat: newListingData.lat,
      lng: newListingData.lng,
      guests: newListingData.guests,
      bedrooms: newListingData.bedrooms,
      beds: newListingData.beds,
      baths: newListingData.baths,
      amenities: selectedAmenities,
      rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)), 
      reviews: Math.floor(Math.random() * 100) + 5,
      host: mockAdminUser, // Listings are added by admin
      university: universityDetails || universityAreas[0], 
      isAvailable: true,
      type: 'Quarto Individual', // Default type, could be part of form
    };
    mockListings.unshift(newListing); 
    return newListing; // Return the created listing, already wrapped by outer async
  } catch (error) {
     console.error("Error in addMockListing:", error);
     throw error; // Re-throw to be caught by caller
  }
};


// Admin Dashboard Mock Data Functions
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const stats = {
      totalRevenue: mockListings.reduce((sum, l) => sum + (l.pricePerNight * 1), 0) * 0.15, // Simplified monthly revenue from "rentals"
      newUsers: 25, 
      pendingApprovals: mockListings.filter(l => l.rating < 4.2).length, // Example: low rated ones are pending
      activeBookings: mockBookings.filter(b => b.status === "Confirmada").length,
    };
    return simulateApiCall(stats, 700);
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error);
    // Return a default/error state or rethrow
    const defaultStats: AdminDashboardStats = { totalRevenue: 0, newUsers: 0, pendingApprovals: 0, activeBookings: 0 };
    return simulateApiCall(defaultStats);
  }
};

export const getMonthlyRevenueData = async (): Promise<{ month: string; revenue: number }[]> => {
  try {
    const data = [
      { month: "Jan", revenue: Math.floor(Math.random() * 2000) + 5000 },
      { month: "Fev", revenue: Math.floor(Math.random() * 2000) + 5500 },
      { month: "Mar", revenue: Math.floor(Math.random() * 2000) + 6000 },
      { month: "Abr", revenue: Math.floor(Math.random() * 2000) + 5800 },
      { month: "Mai", revenue: Math.floor(Math.random() * 2000) + 6200 },
      { month: "Jun", revenue: Math.floor(Math.random() * 2000) + 6500 },
    ];
    return simulateApiCall(data, 600);
  } catch (error) {
     console.error("Error in getMonthlyRevenueData:", error);
     return simulateApiCall([]);
  }
};

export const getBookingStatusData = async (): Promise<{ status: string; count: number; fill: string }[]> => {
  try {
    const data = [
      { status: "Ativas", count: mockBookings.filter(b => b.status === "Confirmada").length, fill: "hsl(var(--chart-1))" },
      { status: "Anteriores", count: mockBookings.filter(b => b.status === "Concluída").length, fill: "hsl(var(--chart-2))" },
      { status: "Canceladas", count: mockBookings.filter(b => b.status === "Cancelada").length, fill: "hsl(var(--chart-3))" },
    ];
    return simulateApiCall(data, 500);
  } catch (error) {
    console.error("Error in getBookingStatusData:", error);
    return simulateApiCall([]);
  }
};

export { mockUser, mockAdminUser };
