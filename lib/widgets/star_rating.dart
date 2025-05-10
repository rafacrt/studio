import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final int totalStars;
  final double size;
  final Color starColor;
  final Color emptyStarColor;
  final bool showText;
  final TextStyle? textStyle;

  const StarRating({
    super.key,
    required this.rating,
    this.totalStars = 5,
    this.size = 16.0,
    this.starColor = const Color(0xFFFFC107), // Yellow
    this.emptyStarColor = const Color(0xFFE0E0E0), // Light Grey
    this.showText = true,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final List<Widget> stars = [];
    final int fullStars = rating.floor();
    final bool hasHalfStar = (rating - fullStars) >= 0.5;

    for (int i = 0; i < totalStars; i++) {
      if (i < fullStars) {
        stars.add(Icon(LucideIcons.star, color: starColor, size: size));
      } else if (i == fullStars && hasHalfStar) {
        stars.add(Icon(LucideIcons.starHalf, color: starColor, size: size));
      } else {
        stars.add(Icon(LucideIcons.star, color: emptyStarColor, size: size));
      }
    }

    if (showText) {
      stars.add(const SizedBox(width: 4.0));
      stars.add(
        Text(
          rating.toStringAsFixed(1).replaceAll('.', ','),
          style: textStyle ?? theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.7),
            fontWeight: FontWeight.w500
          ),
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: stars,
    );
  }
}
