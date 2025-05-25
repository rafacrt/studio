
import type { Listing, User, Booking, Amenity, UniversityArea, ListingFilters, AdminDashboardStats, ListingImage, Category } from '@/types';
import { Bed, Wifi, Tv, Utensils, Snowflake, Car, Bath, Dumbbell, WashingMachine, Trees, LampDesk, CheckSquare, School, Tent, Waves, MountainSnow, Castle, Palette, Sun, Building, Home } from 'lucide-react';
import { mockUser, mockAdminUser } from './auth-mocks';

// Helper function to simulate API call delay
const simulateApiCall = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => {
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
  { id: 'usp-butanta', name: 'Universidade de São Paulo', acronym: 'USP', city: 'São Paulo', neighborhood: 'Butantã', lat: -23.5595, lng: -46.7313, icon: School },
  { id: 'unicamp-barao', name: 'Universidade Estadual de Campinas', acronym: 'Unicamp', city: 'Campinas', neighborhood: 'Barão Geraldo', lat: -22.8178, lng: -47.0687, icon: School },
  { id: 'ufmg-pampulha', name: 'Universidade Federal de Minas Gerais', acronym: 'UFMG', city: 'Belo Horizonte', neighborhood: 'Pampulha', lat: -19.8665, lng: -43.9607, icon: School },
  { id: 'puc-rio', name: 'Pontifícia Universidade Católica do Rio de Janeiro', acronym: 'PUC-Rio', city: 'Rio de Janeiro', neighborhood: 'Gávea', lat: -22.9777, lng: -43.2331, icon: School },
  { id: 'ufsc-trindade', name: 'Universidade Federal de Santa Catarina', acronym: 'UFSC', city: 'Florianópolis', neighborhood: 'Trindade', lat: -27.5999, lng: -48.5172, icon: School },
];

export const roomCategories: Category[] = [
  { id: 'design', label: 'Design', icon: Palette, description: 'Quartos com decoração e design diferenciados.' },
  { id: 'prox-campus', label: 'Perto do Campus', icon: School, description: 'Quartos a uma curta distância da universidade.' },
  { id: 'republica', label: 'Repúblicas', icon: Building, description: 'Vagas em repúblicas estudantis animadas.' },
  { id: 'kitnet', label: 'Kitnets', icon: Home, description: 'Espaços compactos e independentes.' },
  { id: 'alto-padrao', label: 'Alto Padrão', icon: Castle, description: 'Quartos com luxo e comodidades premium.' },
  { id: 'economico', label: 'Econômicos', icon: Bed, description: 'Opções acessíveis para quem quer economizar.' },
  { id: 'praia', label: 'Praia', icon: Waves, description: 'Perto da praia.' },
  { id: 'campo', label: 'Campo', icon: Trees, description: 'Refúgios no campo.' },
  { id: 'montanha', label: 'Montanhas', icon: MountainSnow, description: 'Cabanas e vistas incríveis.' },
  { id: 'deserto', label: 'Deserto', icon: Sun, description: 'Aventura no deserto.' },
  { id: 'camping', label: 'Camping', icon: Tent, description: 'Experiências de acampamento.' },
];


const getUniversityByAcronym = (acronym: string): UniversityArea | undefined => {
    return universityAreas.find(uni => uni.acronym === acronym);
}

const defaultCancellationPolicy = 'Cancelamento flexível: Reembolso total até 5 dias antes do check-in. Após esse período, uma taxa pode ser aplicada.';
const defaultHouseRules = 'Não são permitidas festas ou eventos.\nHorário de silêncio após as 22:00.\nNão fumar dentro do quarto ou áreas comuns.\nMantenha as áreas comuns limpas e organizadas.';
const defaultSafetyAndProperty = 'Detector de fumaça instalado.\nExtintor de incêndio disponível.\nCâmeras de segurança nas áreas comuns externas.';

// Initial Mock Listings
let mockListings: Listing[] = [
  {
    id: 'quarto1',
    title: 'Quarto Aconchegante Próximo à USP',
    description: 'Quarto individual mobiliado, ideal para estudantes da USP. Ambiente tranquilo e seguro, com área de estudos e internet de alta velocidade. Contas inclusas.',
    images: [
      { id: 'img1-1', url: 'https://picsum.photos/seed/quarto1_img1/800/600', alt: 'Vista do quarto aconchegante'},
      { id: 'img1-2', url: 'https://picsum.photos/seed/quarto1_img2/800/600', alt: 'Área de estudos do quarto'},
    ],
    pricePerNight: 1200, 
    address: 'Rua do Matão, 1010, Butantã, São Paulo - SP',
    lat: -23.5580,
    lng: -46.7250,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[2], commonAmenities[8], commonAmenities[10]],
    rating: 4.81,
    reviews: 45,
    host: mockAdminUser, 
    university: getUniversityByAcronym('USP')!,
    isAvailable: true,
    type: 'Quarto Individual',
    category: 'prox-campus',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto2',
    title: 'Kitnet Completa na Unicamp',
    description: 'Kitnet para uma pessoa, totalmente equipada, a poucos minutos da Unicamp. Inclui cozinha compacta, banheiro privativo e Wi-Fi. Perfeito para quem busca praticidade.',
    images: [
      { id: 'img2-1', url: 'https://picsum.photos/seed/quarto2_img1/800/600', alt: 'Visão geral da kitnet'},
      { id: 'img2-2', url: 'https://picsum.photos/seed/quarto2_img2/800/600', alt: 'Cozinha compacta da kitnet'},
      { id: 'img2-3', url: 'https://picsum.photos/seed/quarto2_img3/800/600', alt: 'Banheiro da kitnet'},
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
    rating: 4.53,
    reviews: 30,
    host: mockAdminUser,
    university: getUniversityByAcronym('Unicamp')!,
    isAvailable: true, 
    type: 'Kitnet',
    category: 'kitnet',
    cancellationPolicy: 'Cancelamento moderado: Reembolso total até 15 dias antes do check-in.',
    houseRules: 'Permitido animais de pequeno porte.\nVisitas com aviso prévio.',
    safetyAndProperty: 'Kit de primeiros socorros.',
  },
  {
    id: 'quarto3',
    title: 'Vaga em República perto da UFMG',
    description: 'Vaga em quarto compartilhado em república estudantil bem localizada na Pampulha, próxima à UFMG. Casa com ótima infraestrutura, incluindo lavanderia e área comum.',
    images: [
      { id: 'img3-1', url: 'https://picsum.photos/seed/quarto3_img1/800/600', alt: 'Quarto compartilhado na república' },
    ],
    pricePerNight: 700,
    address: 'Rua Prof. Baeta Viana, 200, Pampulha, Belo Horizonte - MG',
    lat: -19.8690,
    lng: -43.9630,
    guests: 1, 
    bedrooms: 1, 
    beds: 1,
    baths: 2, 
    amenities: [commonAmenities[0], commonAmenities[7], commonAmenities[9]],
    rating: 4.20,
    reviews: 22,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFMG')!,
    isAvailable: true,
    type: 'Vaga em República',
    category: 'republica',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: 'Respeitar os horários dos colegas de quarto.\nLimpeza semanal colaborativa.',
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto4',
    title: 'Studio Design na Gávea (PUC-Rio)',
    description: 'Studio elegante e funcional, perfeito para estudantes da PUC-Rio. Totalmente mobiliado, com design moderno, ar condicionado e cozinha americana. Prédio com portaria 24h.',
    images: [
      { id: 'img4-1', url: 'https://picsum.photos/seed/quarto4_img1/800/600', alt: 'Interior do studio moderno' },
      { id: 'img4-2', url: 'https://picsum.photos/seed/quarto4_img2/800/600', alt: 'Detalhe da cozinha americana' },
    ],
    pricePerNight: 1500,
    address: 'Rua Marquês de São Vicente, 225, Gávea, Rio de Janeiro - RJ',
    lat: -22.9750,
    lng: -43.2300,
    guests: 1,
    bedrooms: 0, 
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[3], commonAmenities[5]],
    rating: 4.92,
    reviews: 55,
    host: mockAdminUser,
    university: getUniversityByAcronym('PUC-Rio')!,
    isAvailable: true,
    type: 'Studio',
    category: 'design',
    cancellationPolicy: 'Cancelamento restrito: Sem reembolso após a reserva.',
    houseRules: 'Não são permitidas crianças.\nApenas o hóspede registrado pode pernoitar.',
    safetyAndProperty: 'Portaria 24h com controle de acesso.',
  },
  {
    id: 'quarto5',
    title: 'Quarto Econômico e Charmoso (UFSC)',
    description: 'Quarto espaçoso em apartamento compartilhado, com varanda privativa e vista para área verde. Localizado no coração da Trindade, ideal para alunos da UFSC.',
    images: [
      { id: 'img5-1', url: 'https://picsum.photos/seed/quarto5_img1/800/600', alt: 'Quarto amplo com acesso à varanda' },
    ],
    pricePerNight: 680,
    address: 'Rua Lauro Linhares, 1000, Trindade, Florianópolis - SC',
    lat: -27.6015,
    lng: -48.5190,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, 
    amenities: [commonAmenities[0], commonAmenities[8], commonAmenities[9], commonAmenities[6]], 
    rating: 4.35,
    reviews: 18,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFSC')!,
    isAvailable: true,
    type: 'Quarto em Apartamento',
    category: 'economico',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto6',
    title: 'Quarto Alto Padrão USP',
    description: 'Opção de luxo para estudantes da USP. Quarto amplo, totalmente decorado, com todas as contas inclusas e limpeza semanal.',
    images: [
      { id: 'img6-1', url: 'https://picsum.photos/seed/quarto6_img1/800/600', alt: 'Quarto alto padrão decorado' },
      { id: 'img6-2', url: 'https://picsum.photos/seed/quarto6_img2/800/600', alt: 'Banheiro do quarto alto padrão' },
    ],
    pricePerNight: 1850,
    address: 'Av. Prof. Luciano Gualberto, 380, Butantã, São Paulo - SP',
    lat: -23.5600, 
    lng: -46.7200,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, 
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[3], commonAmenities[5], commonAmenities[10]],
    rating: 4.95,
    reviews: 60,
    host: mockAdminUser,
    university: getUniversityByAcronym('USP')!, 
    isAvailable: true,
    type: 'Quarto Alto Padrão',
    category: 'alto-padrao',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto7',
    title: 'Suíte Privativa Unicamp (Moradia Estudantil)',
    description: 'Suíte individual em moradia estudantil organizada, próxima à Unicamp. Comodidades incluem cozinha compartilhada e lavanderia. Ideal para foco nos estudos.',
    images: [
      { id: 'img7-1', url: 'https://picsum.photos/seed/quarto7_img1/800/600', alt: 'Suíte privativa mobiliada' },
    ],
    pricePerNight: 1050,
    address: 'Rua Bertrand Russell, 500, Barão Geraldo, Campinas - SP',
    lat: -22.8200,
    lng: -47.0650,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1, 
    amenities: [commonAmenities[0], commonAmenities[5], commonAmenities[7], commonAmenities[8]],
    rating: 4.66,
    reviews: 28,
    host: mockAdminUser,
    university: getUniversityByAcronym('Unicamp')!,
    isAvailable: true,
    type: 'Suíte',
    category: 'prox-campus',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto8',
    title: 'Quarto em República Descolada (UFMG)',
    description: 'Quarto em república com galera animada e muitas áreas comuns. Perto da UFMG, ideal para quem gosta de socializar. Wi-Fi e contas inclusas.',
    images: [
      { id: 'img8-1', url: 'https://picsum.photos/seed/quarto8_img1/800/600', alt: 'Quarto com vista para a lagoa' },
      { id: 'img8-2', url: 'https://picsum.photos/seed/quarto8_img2/800/600', alt: 'Área comum da república' },
    ],
    pricePerNight: 750,
    address: 'Rua Flor-de-índio, 123, Ouro Preto, Belo Horizonte - MG',
    lat: -19.9000,
    lng: -43.9500,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 2, 
    amenities: [commonAmenities[0], commonAmenities[2], commonAmenities[9], commonAmenities[10]],
    rating: 4.40,
    reviews: 25,
    host: mockAdminUser,
    university: getUniversityByAcronym('UFMG')!,
    isAvailable: true,
    type: 'Quarto em República',
    category: 'republica',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
  },
  {
    id: 'quarto9',
    title: 'Kitnet Funcional Próx. PUC-Rio',
    description: 'Kitnet compacta e funcional, ideal para um estudante. Totalmente mobiliada, próxima à PUC-Rio e comércio local. Contas não inclusas.',
    images: [
      { id: 'img9-1', url: 'https://picsum.photos/seed/quarto9_img1/800/600', alt: 'Visão geral da kitnet' },
    ],
    pricePerNight: 1300, 
    address: 'Rua Vice-Governador Rubens Berardo, 50, Gávea, Rio de Janeiro - RJ',
    lat: -22.9760,
    lng: -43.2320,
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [commonAmenities[0], commonAmenities[1], commonAmenities[2], commonAmenities[3]],
    rating: 4.60,
    reviews: 33,
    host: mockAdminUser,
    university: getUniversityByAcronym('PUC-Rio')!,
    isAvailable: true,
    type: 'Kitnet',
    category: 'kitnet',
    cancellationPolicy: defaultCancellationPolicy,
    houseRules: defaultHouseRules,
    safetyAndProperty: defaultSafetyAndProperty,
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
    totalPrice: mockListings.find(l => l.id === 'quarto2')!.pricePerNight * 4.5, 
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


// Ensure mockListings is always at least an empty array if something goes wrong with its definition.
if (!Array.isArray(mockListings)) {
  console.error("CRITICAL: global mockListings is not an array! Re-initializing to empty array.");
  mockListings = [];
}

export const fetchListings = async (page: number, limit: number, filters: ListingFilters): Promise<Listing[]> => {
  let paginatedData: Listing[] = [];
  try {
    if (!Array.isArray(mockListings)) {
      console.error("fetchListings: mockListings is not an array at time of call. Returning empty.");
      return simulateApiCall([], 50); // Resolve with empty
    }

    let filtered = mockListings.filter(listing => {
      if (!listing || typeof listing !== 'object') {
        console.warn("fetchListings: encountered invalid listing object:", listing);
        return false;
      }

      if (filters.university && filters.university !== "__ALL__") {
        if (!listing.university || typeof listing.university.acronym !== 'string' || listing.university.acronym !== filters.university) {
          return false;
        }
      }
      if (filters.minPrice !== undefined) {
        if (typeof listing.pricePerNight !== 'number' || listing.pricePerNight < filters.minPrice) {
          return false;
        }
      }
      if (filters.maxPrice !== undefined) {
        if (typeof listing.pricePerNight !== 'number' || listing.pricePerNight > filters.maxPrice) {
          return false;
        }
      }
       if (filters.category && filters.category !== "__ALL__") {
        if (!listing.category || listing.category !== filters.category) {
          return false;
        }
      }
      if (filters.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const titleMatch = listing.title && typeof listing.title === 'string' && listing.title.toLowerCase().includes(searchTermLower);
        const addressMatch = listing.address && typeof listing.address === 'string' && listing.address.toLowerCase().includes(searchTermLower);
        const universityMatch = listing.university && listing.university.name.toLowerCase().includes(searchTermLower);
        const cityMatch = listing.university && listing.university.city.toLowerCase().includes(searchTermLower);
        if (!titleMatch && !addressMatch && !universityMatch && !cityMatch) {
          return false;
        }
      }
      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    paginatedData = filtered.slice(start, end);
    return simulateApiCall(paginatedData, 300);

  } catch (error) {
    console.error("Error explicitly caught during fetchListings filtering/slicing logic:", error);
    return simulateApiCall([], 50); // Ensure it always resolves with an array
  }
};


export const getRoomById = async (id: string): Promise<Listing | undefined> => {
 try {
    const room = mockListings.find(listing => listing && listing.id === id);
    // Ensure images always have a placeholder if empty for this room
    if (room && (!room.images || room.images.length === 0)) {
        room.images = [{ id: 'placeholder', url: `https://picsum.photos/seed/${id}_placeholder/800/600`, alt: 'Imagem do quarto indisponível' }];
    }
    return simulateApiCall(room);
  } catch (error) {
    console.error("Error in getRoomById:", error);
    return simulateApiCall(undefined); 
  }
};

export const bookMockRoom = async (listingId: string, userId: string, checkInDate: string, checkOutDate: string, guests: number): Promise<Booking> => {
  try {
    const listing = mockListings.find(l => l && l.id === listingId);
    if (!listing) {
      throw new Error("Quarto não encontrado para reserva.");
    }
    if (!listing.isAvailable) {
      throw new Error("Este quarto não está mais disponível.");
    }

    listing.isAvailable = false; 

    const newBooking: Booking = {
      id: `booking${Date.now()}${Math.random().toString(16).slice(2)}`,
      listingId,
      listing,
      userId,
      user: mockUser, 
      checkInDate,
      checkOutDate,
      totalPrice: listing.pricePerNight * 30, 
      status: 'Confirmada',
      guests,
    };
    mockBookings.push(newBooking);
    return simulateApiCall(newBooking, 1000); 
  } catch (error) {
    console.error("Error in bookMockRoom:", error);
    return Promise.reject(error); 
  }
};

export const fetchUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const userBookings = mockBookings.filter(booking => booking && booking.userId === userId);
    return simulateApiCall(userBookings);
  } catch (error) {
    console.error("Error in fetchUserBookings:", error);
    return simulateApiCall([]);
  }
};

export const addMockListing = async (
  newListingData: Omit<Listing, 'id' | 'rating' | 'reviews' | 'host' | 'amenities' | 'images' | 'university'> & { 
    imageUrls: string[]; 
    selectedAmenityIds: string[]; 
    universityAcronym: string;
    // category: string; // Category will be derived or set to a default if not explicitly part of form
    cancellationPolicy: string;
    houseRules: string;
    safetyAndProperty: string;
  }
): Promise<Listing> => {
  try {
    await simulateApiCall(null, 300); 
    const newId = `quarto${mockListings.length + 1}${Date.now().toString().slice(-4)}`;
    
    let images: ListingImage[] = [];
    if (Array.isArray(newListingData.imageUrls)) {
      images = newListingData.imageUrls.map((url, index) => ({ 
        id: `img${newId}-${index}`, 
        url: typeof url === 'string' && url.startsWith('http') ? url : `https://picsum.photos/seed/${newId}_img${index + 1}/800/600`, 
        alt: `${newListingData.title || 'Anúncio'} - Imagem ${index + 1}` 
      }));
    }
    if (images.length === 0) { // Ensure at least one placeholder image
        images.push({ id: `img${newId}-placeholder`, url: `https://picsum.photos/seed/${newId}_placeholder/800/600`, alt: `${newListingData.title || 'Anúncio'} - Imagem Padrão` });
    }
    
    let selectedAmenities: Amenity[] = [];
    if(Array.isArray(newListingData.selectedAmenityIds)) {
      selectedAmenities = commonAmenities.filter(amenity => newListingData.selectedAmenityIds.includes(amenity.id));
    }


    const universityDetails = universityAreas.find(uni => uni.acronym === newListingData.universityAcronym);
    if (!universityDetails) {
      console.warn(`University with acronym ${newListingData.universityAcronym} not found. Defaulting.`);
    }
    
    // Determine category (example logic, can be refined)
    let listingCategory = roomCategories.find(cat => cat.id === 'prox-campus')?.id || roomCategories[0].id; // Default
    if (newListingData.title.toLowerCase().includes('kitnet')) listingCategory = 'kitnet';
    else if (newListingData.title.toLowerCase().includes('república')) listingCategory = 'republica';


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
      host: mockAdminUser, 
      university: universityDetails || universityAreas[0], 
      isAvailable: true,
      type: newListingData.type || 'Quarto Individual', // Ensure type is present
      category: listingCategory,
      cancellationPolicy: newListingData.cancellationPolicy || defaultCancellationPolicy,
      houseRules: newListingData.houseRules || defaultHouseRules,
      safetyAndProperty: newListingData.safetyAndProperty || defaultSafetyAndProperty,
    };
    mockListings.unshift(newListing); 
    return newListing; 
  } catch (error) {
     console.error("Error in addMockListing:", error);
     throw error; 
  }
};


export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const activeBookingsCount = mockBookings.filter(b => b && b.status === "Confirmada").length;
    const totalRevenueFromBookings = mockBookings
      .filter(b => b && (b.status === "Confirmada" || b.status === "Concluída"))
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    const stats: AdminDashboardStats = {
      totalRevenue: totalRevenueFromBookings * 0.15, // Example: 15% commission on bookings
      newUsers: 25, // Static mock value
      pendingApprovals: mockListings.filter(l => l && l.rating < 4.2 && l.isAvailable).length, // Example criteria
      activeBookings: activeBookingsCount,
    };
    return simulateApiCall(stats, 700);
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error);
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
      { status: "Ativas", count: mockBookings.filter(b => b && b.status === "Confirmada").length, fill: "hsl(var(--chart-1))" },
      { status: "Anteriores", count: mockBookings.filter(b => b && b.status === "Concluída").length, fill: "hsl(var(--chart-2))" },
      { status: "Canceladas", count: mockBookings.filter(b => b && b.status === "Cancelada").length, fill: "hsl(var(--chart-3))" },
    ]; 
    return simulateApiCall(data, 500);
  } catch (error) {
    console.error("Error in getBookingStatusData:", error);
    return simulateApiCall([]);
  }
};

export { mockUser, mockAdminUser };

