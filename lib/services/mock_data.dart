import 'package:alugo/models/amenity_model.dart';
import 'package:alugo/models/booking_model.dart';
import 'package:alugo/models/listing_model.dart';
import 'package:alugo/models/review_model.dart';
import 'package:alugo/models/user_model.dart';
import 'package:flutter/material.dart'; // For IconData
import 'package:lucide_flutter/lucide_flutter.dart';
import 'dart:math';

// Global lists to store mock data
List<Listing> _mockListings = [];
List<Booking> _mockBookings = [];

// Mock Users
final User mockUser = User(
  id: 'user1',
  email: 'teste@exemplo.com',
  name: 'Alex Silva',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  isAdmin: false,
);

final User mockAdminUser = User(
  id: 'admin1',
  email: 'admin@alugo.com', // Changed to alugo.com
  name: 'Admin Alugo',
  avatarUrl: 'https://picsum.photos/seed/admin1/100/100',
  isAdmin: true,
);

// Common Amenities
final List<Amenity> commonAmenities = [
  Amenity(id: 'wifi', name: 'Wi-Fi', iconData: LucideIcons.wifi),
  Amenity(id: 'desk', name: 'Escrivaninha', iconData: LucideIcons.bookOpen),
  Amenity(id: 'wardrobe', name: 'Guarda-roupa', iconData: LucideIcons.briefcase),
  Amenity(id: 'kitchen', name: 'Cozinha Compartilhada', iconData: LucideIcons.utensils),
  Amenity(id: 'laundry', name: 'Lavanderia Compartilhada', iconData: LucideIcons.wind),
  Amenity(id: 'bathroom', name: 'Banheiro Privativo', iconData: LucideIcons.bath),
  Amenity(id: 'air-conditioner', name: 'Ar Condicionado', iconData: LucideIcons.thermometer),
  Amenity(id: 'parking', name: 'Estacionamento', iconData: LucideIcons.parkingSquare),
  Amenity(id: 'tv', name: 'Televisão', iconData: LucideIcons.tv),
];

class UniversityArea {
  final String city;
  final String name;
  final String acronym;
  final String neighborhood;
  final LatLng location;

  UniversityArea({
    required this.city,
    required this.name,
    required this.acronym,
    required this.neighborhood,
    required this.location,
  });
}

final List<UniversityArea> universityAreas = [
  UniversityArea(city: "São Paulo", name: "Universidade de São Paulo", acronym: "USP", neighborhood: "Butantã", location: LatLng(lat: -23.5595, lng: -46.7313)),
  UniversityArea(city: "Rio de Janeiro", name: "Universidade Federal do Rio de Janeiro", acronym: "UFRJ", neighborhood: "Urca", location: LatLng(lat: -22.9523, lng: -43.1691)),
  UniversityArea(city: "Belo Horizonte", name: "Universidade Federal de Minas Gerais", acronym: "UFMG", neighborhood: "Pampulha", location: LatLng(lat: -19.8593, lng: -43.9682)),
  UniversityArea(city: "Porto Alegre", name: "Universidade Federal do Rio Grande do Sul", acronym: "UFRGS", neighborhood: "Centro Histórico", location: LatLng(lat: -30.0331, lng: -51.2302)),
  UniversityArea(city: "Recife", name: "Universidade Federal de Pernambuco", acronym: "UFPE", neighborhood: "Cidade Universitária", location: LatLng(lat: -8.0476, lng: -34.9518)),
  UniversityArea(city: "Curitiba", name: "Universidade Federal do Paraná", acronym: "UFPR", neighborhood: "Jardim Botânico", location: LatLng(lat: -25.4464, lng: -49.2398)),
  UniversityArea(city: "Campinas", name: "Universidade Estadual de Campinas", acronym: "Unicamp", neighborhood: "Barão Geraldo", location: LatLng(lat: -22.8175, lng: -47.0699)),
  UniversityArea(city: "Salvador", name: "Universidade Federal da Bahia", acronym: "UFBA", neighborhood: "Federação", location: LatLng(lat: -12.9935, lng: -38.5078)),
  UniversityArea(city: "Fortaleza", name: "Universidade Federal do Ceará", acronym: "UFC", neighborhood: "Benfica", location: LatLng(lat: -3.7419, lng: -38.5428)),
];


// Initialize mock data (call this in main.dart)
void initializeMockData() {
  final Random random = Random();

  List<Review> generateReviews(String listingId, int count) {
    final reviews = <Review>[];
    const reviewComments = [
      "Excelente quarto para estudantes! Localização perfeita, perto da faculdade e com tudo que preciso. Recomendo!",
      "Muito bom! O quarto é confortável, a internet é rápida e o ambiente é tranquilo para estudar. Anfitrião atencioso.",
      "Adorei minha estadia. O quarto é exatamente como nas fotos, limpo e organizado. Ótimo custo-benefício para universitários.",
      "Localização privilegiada, fácil acesso ao transporte e restaurantes. O quarto tem uma boa escrivaninha para estudos.",
      "Recomendo fortemente! Ambiente seguro e ideal para quem precisa focar nos estudos. Voltarei com certeza."
    ];
    for (int i = 1; i <= count; i++) {
      reviews.add(Review(
        id: 'review-$listingId-$i',
        userName: 'Estudante $i',
        userAvatarUrl: 'https://picsum.photos/seed/reviewer$i/50/50',
        rating: (random.nextInt(2) + 4).toDouble(), // 4.0 or 5.0
        comment: reviewComments[i % reviewComments.length],
        date: DateTime(2023, 11, 10 + i),
      ));
    }
    return reviews;
  }

  _mockListings = List.generate(27, (i) { // Generate more for pagination
    final areaInfo = universityAreas[i % universityAreas.length];
    final latOffset = (random.nextDouble() - 0.5) * 0.01;
    final lngOffset = (random.nextDouble() - 0.5) * 0.01;
    final price = (350 + random.nextInt(600)).toDouble(); // Price per month

    return Listing(
      id: 'quarto${i + 1}',
      title: 'Quarto Universitário perto da ${areaInfo.acronym} em ${areaInfo.neighborhood}',
      description: 'Quarto individual mobiliado, ideal para estudantes da ${areaInfo.name} (${areaInfo.acronym}). Localizado em ${areaInfo.neighborhood}, ${areaInfo.city}. Ambiente tranquilo e seguro, com escrivaninha, cadeira confortável e internet de alta velocidade. Perfeito para focar nos estudos e aproveitar a vida universitária.',
      images: [
        'https://picsum.photos/seed/quarto${i + 1}_1/800/450',
        'https://picsum.photos/seed/quarto${i + 1}_2/800/450',
        'https://picsum.photos/seed/quarto${i + 1}_3/800/450',
        'https://picsum.photos/seed/quarto${i + 1}_4/800/450',
      ],
      pricePerMonth: price,
      rating: double.parse((4.3 + random.nextDouble() * 0.7).toStringAsFixed(1)),
      address: 'Rua dos Estudantes, ${100 + i}, ${areaInfo.neighborhood}, ${areaInfo.city}, Próximo à ${areaInfo.acronym}',
      location: LatLng(lat: areaInfo.location.lat + latOffset, lng: areaInfo.location.lng + lngOffset),
      amenities: List<Amenity>.from(commonAmenities)..shuffle(random)..sublist(0, 3 + (i % (commonAmenities.length - 2))),
      host: ListingHost(name: 'Anfitrião ${String.fromCharCode(65 + (i % 26))}', avatarUrl: 'https://picsum.photos/seed/host${i + 1}/80/80'),
      reviews: generateReviews('quarto${i + 1}', 2 + (i % 4)),
      type: "Quarto para universitário",
      guests: 1,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      universityName: areaInfo.name,
      universityAcronym: areaInfo.acronym,
    );
  });


  _mockBookings = [
    Booking(
      id: 'reserva1',
      listingId: _mockListings[0].id,
      listingTitle: _mockListings[0].title,
      listingImage: _mockListings[0].images[0],
      userId: mockUser.id,
      startDate: DateTime(2024, 8, 1),
      endDate: DateTime(2024, 12, 20),
      totalPrice: _mockListings[0].pricePerMonth * 4.5,
      status: BookingStatus.active,
    ),
    Booking(
      id: 'reserva2',
      listingId: _mockListings[2].id,
      listingTitle: _mockListings[2].title,
      listingImage: _mockListings[2].images[0],
      userId: mockUser.id,
      startDate: DateTime(2024, 2, 10),
      endDate: DateTime(2024, 6, 30),
      totalPrice: _mockListings[2].pricePerMonth * 4.5,
      status: BookingStatus.past,
    ),
     Booking(
      id: 'reserva3',
      listingId: _mockListings[4].id,
      listingTitle: _mockListings[4].title,
      listingImage: _mockListings[4].images[0],
      userId: mockUser.id,
      startDate: DateTime(2025, 1, 15),
      endDate: DateTime(2025, 5, 15),
      totalPrice: _mockListings[4].pricePerMonth * 4,
      status: BookingStatus.active,
    ),
  ];
}


class MockDataService {
  static Future<List<Listing>> fetchListings({int page = 1, int limit = 9}) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    final start = (page - 1) * limit;
    final end = start + limit;
    if (start >= _mockListings.length) {
      return [];
    }
    return _mockListings.sublist(start, min(end, _mockListings.length));
  }

  static Future<Listing?> fetchListingById(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    try {
      return _mockListings.firstWhere((listing) => listing.id == id);
    } catch (e) {
      return null; // Not found
    }
  }

  static Future<List<Booking>> fetchUserBookings(String userId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _mockBookings.where((booking) => booking.userId == userId).toList();
  }

  static Future<UniversityArea?> getUniversityByAcronym(String acronym) async {
     await Future.delayed(const Duration(milliseconds: 100));
     try {
      return universityAreas.firstWhere((ua) => ua.acronym == acronym);
    } catch (e) {
      return null;
    }
  }

  // Simulate renting a room
  static Future<bool> rentRoom(String listingId, String userId) async {
    await Future.delayed(const Duration(milliseconds: 1000));
    Listing? listing = await fetchListingById(listingId);
    if (listing != null && !listing.isRented) {
      listing.isRented = true;
      // Create a new booking
      final newBooking = Booking(
        id: 'booking-${DateTime.now().millisecondsSinceEpoch}',
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.images.first,
        userId: userId,
        startDate: DateTime.now(),
        endDate: DateTime.now().add(const Duration(days: 30 * 4)), // Approx 4 months
        totalPrice: listing.pricePerMonth * 4,
        status: BookingStatus.active,
      );
      _mockBookings.add(newBooking);
      return true;
    }
    return false;
  }
}

// Helper function to simulate API call delay for other potential uses
Future<T> simulateApiCall<T>(T data, {int delayMs = 300}) {
  return Future.delayed(Duration(milliseconds: delayMs), () => data);
}
