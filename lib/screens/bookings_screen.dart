import 'package:flutter/material.dart';
import 'package:alugo/services/mock_data.dart';
import 'package:alugo/models/booking_model.dart';
import 'package:alugo/widgets/booking_card.dart';
import 'package:provider/provider.dart';
import 'package:alugo/providers/auth_provider.dart';
import 'package:lucide_flutter/lucide_flutter.dart';


class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Booking> _activeBookings = [];
  List<Booking> _pastBookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _isLoading = true;
    });
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.user != null) {
      final bookings = await MockDataService.fetchUserBookings(authProvider.user!.id);
      setState(() {
        _activeBookings = bookings.where((b) => b.status == BookingStatus.active).toList();
        _pastBookings = bookings.where((b) => b.status == BookingStatus.past || b.status == BookingStatus.cancelled).toList();
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Minhas Reservas'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Theme.of(context).colorScheme.primary,
          labelColor: Theme.of(context).colorScheme.primary,
          unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
          tabs: const [
            Tab(text: 'Ativas'),
            Tab(text: 'Anteriores'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBookingList(_activeBookings, 'ativas'),
          _buildBookingList(_pastBookings, 'anteriores'),
        ],
      ),
    );
  }

  Widget _buildBookingList(List<Booking> bookings, String type) {
    if (_isLoading) {
      return ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: 3, // Skeleton count
        itemBuilder: (context, index) => const BookingCardSkeleton(),
      );
    }
    if (bookings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.calendarX2, size: 48, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
              const SizedBox(height: 16),
              Text('Nenhuma reserva $type encontrada.', style: Theme.of(context).textTheme.bodyLarge),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: BookingCard(booking: bookings[index]),
        );
      },
    );
  }
}
