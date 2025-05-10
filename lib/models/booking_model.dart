enum BookingStatus { active, past, cancelled }

class Booking {
  final String id;
  final String listingId;
  final String listingTitle;
  final String listingImage;
  final String userId;
  final DateTime startDate;
  final DateTime endDate;
  final double totalPrice;
  final BookingStatus status;

  Booking({
    required this.id,
    required this.listingId,
    required this.listingTitle,
    required this.listingImage,
    required this.userId,
    required this.startDate,
    required this.endDate,
    required this.totalPrice,
    required this.status,
  });
}
