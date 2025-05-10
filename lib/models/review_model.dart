class Review {
  final String id;
  final String userName;
  final String userAvatarUrl;
  final double rating; // Changed from int to double for more precision if needed
  final String comment;
  final DateTime date; // Changed from String to DateTime

  Review({
    required this.id,
    required this.userName,
    required this.userAvatarUrl,
    required this.rating,
    required this.comment,
    required this.date,
  });
}
