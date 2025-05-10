import 'package:flutter/material.dart';
import 'package:alugo/models/listing_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:alugo/widgets/star_rating.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:intl/intl.dart';

class ListingCard extends StatelessWidget {
  final Listing listing;
  final VoidCallback? onTap;

  const ListingCard({super.key, required this.listing, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final NumberFormat currencyFormatter = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$', decimalDigits: 0);

    return Card(
      clipBehavior: Clip.antiAlias, // Ensures the image corners are rounded with the card
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            AspectRatio(
              aspectRatio: 16 / 9,
              child: CachedNetworkImage(
                imageUrl: listing.images.isNotEmpty ? listing.images[0] : 'https://picsum.photos/400/225',
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[300],
                  child: const Center(child: Icon(LucideIcons.imageOff, color: Colors.grey, size: 40)),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[300],
                  child: const Center(child: Icon(LucideIcons.imageOff, color: Colors.grey, size: 40, semanticLabel: "Erro ao carregar imagem",)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    listing.title,
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    listing.address.split(',').take(2).join(', ').trim(),
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.7)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4.0),
                  Row(
                    children: [
                      Icon(LucideIcons.school, size: 14, color: theme.colorScheme.primary),
                      const SizedBox(width: 4.0),
                      Expanded(
                        child: Text(
                          'Próximo à ${listing.universityAcronym}',
                          style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.7)),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Text(
                        '${currencyFormatter.format(listing.pricePerMonth)} / mês',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      StarRating(
                        rating: listing.rating,
                        size: 16,
                        showText: true,
                        textStyle: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


class ListingCardSkeleton extends StatelessWidget {
  const ListingCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(color: Colors.grey[300]),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(width: double.infinity, height: 16.0, color: Colors.grey[300]),
                const SizedBox(height: 6.0),
                Container(width: MediaQuery.of(context).size.width * 0.5, height: 12.0, color: Colors.grey[300]),
                const SizedBox(height: 6.0),
                Container(width: MediaQuery.of(context).size.width * 0.3, height: 12.0, color: Colors.grey[300]),
                const SizedBox(height: 10.0),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Container(width: 80.0, height: 14.0, color: Colors.grey[300]),
                    Container(width: 60.0, height: 14.0, color: Colors.grey[300]),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
