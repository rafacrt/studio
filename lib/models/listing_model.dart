import 'amenity_model.dart';
import 'review_model.dart';

class LatLng {
  final double lat;
  final double lng;

  LatLng({required this.lat, required this.lng});
}

class ListingHost {
  final String name;
  final String avatarUrl;

  ListingHost({required this.name, required this.avatarUrl});
}

class Listing {
  final String id;
  final String title;
  final String description;
  final List<String> images;
  final double pricePerMonth; // Changed from pricePerNight to reflect "aprox. / mês"
  final double rating;
  final String address;
  final LatLng location;
  final List<Amenity> amenities;
  final ListingHost host;
  final List<Review> reviews;
  final String type; // e.g. "Quarto para universitário"
  final int guests;
  final int bedrooms;
  final int beds;
  final int baths;
  final String universityName;
  final String universityAcronym;
  bool isRented; // To manage rented state client-side for demo

  Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.images,
    required this.pricePerMonth,
    required this.rating,
    required this.address,
    required this.location,
    required this.amenities,
    required this.host,
    required this.reviews,
    required this.type,
    required this.guests,
    required this.bedrooms,
    required this.beds,
    required this.baths,
    required this.universityName,
    required this.universityAcronym,
    this.isRented = false,
  });
}
