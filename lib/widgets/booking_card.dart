import 'package:flutter/material.dart';
import 'package:alugo/models/booking_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/screens/room_detail_screen.dart';
import 'package:alugo/screens/access_screen.dart'; // For navigating to AccessScreen
import 'package:alugo/utils/colors.dart'; // For status colors

class BookingCard extends StatelessWidget {
  final Booking booking;

  const BookingCard({super.key, required this.booking});

  String _formatDateRange(DateTime start, DateTime end) {
    final DateFormat formatter = DateFormat('dd/MM/yyyy', 'pt_BR');
    return '${formatter.format(start)} - ${formatter.format(end)}';
  }

  String _getStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.active:
        return 'Ativa';
      case BookingStatus.past:
        return 'Anterior';
      case BookingStatus.cancelled:
        return 'Cancelada';
    }
  }

  Color _getStatusColor(BuildContext context, BookingStatus status) {
    // Use theme colors for better adaptability
    final theme = Theme.of(context);
    switch (status) {
      case BookingStatus.active:
        return theme.brightness == Brightness.light ? kChartColorActive : kDarkAccent;
      case BookingStatus.past:
        return theme.colorScheme.onSurface.withOpacity(0.6);
      case BookingStatus.cancelled:
        return theme.colorScheme.error;
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormatter = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$', decimalDigits: 2);
    final statusColor = _getStatusColor(context, booking.status);
    final statusTextColor = statusColor.computeLuminance() > 0.5 ? Colors.black : Colors.white;


    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.35, // Fixed width for image
                height: MediaQuery.of(context).size.width * 0.35, // Make it square
                child: CachedNetworkImage(
                  imageUrl: booking.listingImage,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: Colors.grey[300]),
                  errorWidget: (context, url, error) => const Icon(LucideIcons.imageOff),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween, // Ensure content fills height
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              booking.listingTitle,
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Chip(
                            label: Text(_getStatusText(booking.status), style: TextStyle(color: statusTextColor, fontSize: 10)),
                            backgroundColor: statusColor,
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            labelPadding: EdgeInsets.zero,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6.0),
                      Row(
                        children: [
                           Icon(LucideIcons.calendarDays, size: 14, color: theme.textTheme.bodySmall?.color),
                           const SizedBox(width: 4),
                           Expanded(
                             child: Text(
                               _formatDateRange(booking.startDate, booking.endDate),
                               style: theme.textTheme.bodySmall,
                               overflow: TextOverflow.ellipsis,
                             ),
                           ),
                        ],
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        'Total: ${currencyFormatter.format(booking.totalPrice)}',
                        style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8.0), // Spacer
                       Align(
                        alignment: Alignment.bottomRight,
                        child: _buildActionButton(context),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context) {
    if (booking.status == BookingStatus.active) {
      return ElevatedButton.icon(
        icon: const Icon(LucideIcons.keyRound, size: 16),
        label: const Text('Acessar Quarto'),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => AccessScreen(listingId: booking.listingId)),
          );
        },
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          textStyle: const TextStyle(fontSize: 12),
        ),
      );
    } else if (booking.status == BookingStatus.past) {
      return OutlinedButton(
        child: const Text('Ver Quarto', style: TextStyle(fontSize: 12)),
        onPressed: () {
           Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => RoomDetailScreen(listingId: booking.listingId)),
          );
        },
         style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
      );
    }
    return const SizedBox.shrink(); // No button for cancelled or other statuses
  }
}


class BookingCardSkeleton extends StatelessWidget {
  const BookingCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      clipBehavior: Clip.antiAlias,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: MediaQuery.of(context).size.width * 0.35,
            height: MediaQuery.of(context).size.width * 0.35,
            color: Colors.grey[300],
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: MediaQuery.of(context).size.width * 0.3, height: 16.0, color: Colors.grey[300]),
                      Container(width: 50, height: 20, color: Colors.grey[200]),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Container(width: MediaQuery.of(context).size.width * 0.4, height: 12.0, color: Colors.grey[300]),
                  const SizedBox(height: 6.0),
                  Container(width: MediaQuery.of(context).size.width * 0.25, height: 14.0, color: Colors.grey[300]),
                  const SizedBox(height: 10.0),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Container(width: 100, height: 30, color: Colors.grey[200]),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

