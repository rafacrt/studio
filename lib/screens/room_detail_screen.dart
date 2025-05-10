import 'package:alugo/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:alugo/services/mock_data.dart';
import 'package:alugo/models/listing_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/widgets/star_rating.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
// import 'package:alugo/widgets/listing_map_widget.dart'; // You'll need to create this

class RoomDetailScreen extends StatefulWidget {
  final String listingId;

  const RoomDetailScreen({super.key, required this.listingId});

  @override
  State<RoomDetailScreen> createState() => _RoomDetailScreenState();
}

class _RoomDetailScreenState extends State<RoomDetailScreen> {
  Listing? _listing;
  bool _isLoading = true;
  bool _showFullDescription = false;
  PageController _pageController = PageController();
  int _currentImageIndex = 0;
  bool _isRenting = false; // For rent button loading state


  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _loadListingDetails();
  }

  Future<void> _loadListingDetails() async {
    setState(() {
      _isLoading = true;
    });
    final fetchedListing = await MockDataService.fetchListingById(widget.listingId);
    // Check if already rented (local simulation)
    // In a real app, this would come from user's active bookings or listing status from backend
    final rentedRooms = await _getRentedRoomIds(); 
    if (fetchedListing != null) {
       fetchedListing.isRented = rentedRooms.contains(fetchedListing.id);
    }

    if (mounted) {
      setState(() {
        _listing = fetchedListing;
        _isLoading = false;
      });
    }
  }

  Future<List<String>> _getRentedRoomIds() async {
    // This is a local simulation. In a real app, this would be fetched.
    // For now, we'll assume it's based on user's active bookings in mock data.
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.user == null) return [];
    
    final userBookings = await MockDataService.fetchUserBookings(authProvider.user!.id);
    return userBookings.where((b) => b.status == BookingStatus.active).map((b) => b.listingId).toList();
  }

   Future<void> _saveRentedRoomId(String listingId) async {
    // This is purely for local simulation to persist the "rented" state
    // It doesn't represent a real booking process but helps mock UI changes
    // No actual SharedPreferences write here as it's complex for a quick mock
    // and the true state should come from backend/bookings
   }


  Future<void> _handleRent() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Você precisa estar logado para alugar.'), backgroundColor: Colors.orange),
      );
      // Optionally navigate to login screen
      return;
    }

    if (_listing == null) return;

    setState(() { _isRenting = true; });

    bool success = await MockDataService.rentRoom(_listing!.id, authProvider.user!.id);
    
    if (mounted) {
      setState(() { _isRenting = false; });
      if (success) {
         await _saveRentedRoomId(_listing!.id); // Update local simulation
         setState(() {
           _listing!.isRented = true;
         });
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Quarto "${_listing!.title}" alugado!'), backgroundColor: Theme.of(context).colorScheme.tertiary),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Não foi possível alugar o quarto.'), backgroundColor: Colors.red),
        );
      }
    }
  }


  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(appBar: AppBar(), body: const Center(child: CircularProgressIndicator()));
    }

    if (_listing == null) {
      return Scaffold(appBar: AppBar(), body: const Center(child: Text('Quarto não encontrado.')));
    }

    final currencyFormatter = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$', decimalDigits: 0);

    return Scaffold(
      body: CustomScrollView(
        slivers: <Widget>[
          SliverAppBar(
            expandedHeight: 250.0,
            pinned: true,
            floating: false,
            leading: IconButton(
              icon: Icon(LucideIcons.chevronLeft, color: _currentImageIndex == 0 && _listing!.images.length > 1 ? Colors.white : theme.colorScheme.onSurface),
              onPressed: () => Navigator.of(context).pop(),
              style: IconButton.styleFrom(backgroundColor: Colors.black.withOpacity(0.3)),
            ),
            actions: [
              IconButton(
                icon: Icon(LucideIcons.share2, color: _currentImageIndex == 0 && _listing!.images.length > 1 ? Colors.white : theme.colorScheme.onSurface),
                onPressed: () { /* Share action */ },
                style: IconButton.styleFrom(backgroundColor: Colors.black.withOpacity(0.3)),
              ),
              IconButton(
                icon: Icon(LucideIcons.heart, color: _currentImageIndex == 0 && _listing!.images.length > 1 ? Colors.white : theme.colorScheme.onSurface),
                onPressed: () { /* Favorite action */ },
                style: IconButton.styleFrom(backgroundColor: Colors.black.withOpacity(0.3)),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: _listing!.images.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentImageIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return CachedNetworkImage(
                        imageUrl: _listing!.images[index],
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: Colors.grey[300]),
                        errorWidget: (context, url, error) => const Icon(LucideIcons.imageOff),
                      );
                    },
                  ),
                  if (_listing!.images.length > 1)
                    Align(
                      alignment: Alignment.bottomCenter,
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(_listing!.images.length, (index) {
                            return Container(
                              width: 8.0,
                              height: 8.0,
                              margin: const EdgeInsets.symmetric(horizontal: 4.0),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _currentImageIndex == index
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.5),
                              ),
                            );
                          }),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(_listing!.title, style: theme.textTheme.headlineMedium),
                const SizedBox(height: 8),
                Row(
                  children: [
                    StarRating(rating: _listing!.rating, size: 18),
                    const SizedBox(width: 8),
                    Text('(${_listing!.reviews.length} avaliações) · ', style: theme.textTheme.bodySmall),
                    Icon(LucideIcons.mapPin, size: 14, color: theme.textTheme.bodySmall?.color),
                    Expanded(child: Text(' ${_listing!.address.split(",")[1].trim()}', style: theme.textTheme.bodySmall, overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 8),
                 Row(
                  children: [
                    Icon(LucideIcons.school, size: 20, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Próximo à ${_listing!.universityName} (${_listing!.universityAcronym})',
                        style: theme.textTheme.titleSmall,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 32),
                _buildRoomStats(theme),
                const Divider(height: 32),
                _buildDescription(theme),
                const Divider(height: 32),
                _buildAmenities(theme),
                // TODO: Add Map Section
                // const Divider(height: 32),
                // Text('Onde você vai estar', style: theme.textTheme.titleLarge),
                // const SizedBox(height: 8),
                // ListingMapWidget(listingLocation: _listing!.location, universityLocation: LatLng(lat: -23.5595, lng: -46.7313), universityName: _listing!.universityName), // Example coords
                const Divider(height: 32),
                _buildReviews(theme),
                const SizedBox(height: 80), // Space for floating action button
              ]),
            ),
          ),
        ],
      ),
      bottomSheet: _buildRentButton(context, currencyFormatter),
    );
  }

  Widget _buildRoomStats(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _statItem(LucideIcons.users, '${_listing!.guests} universitário(s)', theme),
        _statItem(LucideIcons.bedDouble, '${_listing!.bedrooms} quarto(s)', theme),
        _statItem(LucideIcons.bath, '${_listing!.baths} banheiro(s)', theme),
      ],
    );
  }

  Widget _statItem(IconData icon, String text, ThemeData theme) {
    return Column(
      children: [
        Icon(icon, size: 24, color: theme.colorScheme.primary),
        const SizedBox(height: 4),
        Text(text, style: theme.textTheme.bodySmall),
      ],
    );
  }

  Widget _buildDescription(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Sobre este quarto', style: theme.textTheme.titleLarge),
        const SizedBox(height: 8),
        Text(
          _listing!.description,
          style: theme.textTheme.bodyMedium,
          maxLines: _showFullDescription ? null : 4,
          overflow: _showFullDescription ? null : TextOverflow.ellipsis,
        ),
        TextButton(
          onPressed: () {
            setState(() {
              _showFullDescription = !_showFullDescription;
            });
          },
          child: Text(_showFullDescription ? 'Mostrar menos' : 'Mostrar mais'),
        ),
      ],
    );
  }

  Widget _buildAmenities(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('O que este quarto oferece', style: theme.textTheme.titleLarge),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _listing!.amenities.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 5 / 1,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemBuilder: (context, index) {
            final amenity = _listing!.amenities[index];
            return Row(
              children: [
                Icon(amenity.iconData, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.7)),
                const SizedBox(width: 8),
                Expanded(child: Text(amenity.name, style: theme.textTheme.bodyMedium, overflow: TextOverflow.ellipsis)),
              ],
            );
          },
        ),
        // if (_listing!.amenities.length > 4) ...[ // Example for "show all"
        //   const SizedBox(height: 8),
        //   TextButton(onPressed: () {}, child: Text('Mostrar todas as ${_listing!.amenities.length} comodidades')),
        // ]
      ],
    );
  }

   Widget _buildReviews(ThemeData theme) {
    if (_listing!.reviews.isEmpty) {
      return Text('Nenhuma avaliação ainda.', style: theme.textTheme.bodyMedium);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(LucideIcons.star, color: Colors.amber, size: 22),
            const SizedBox(width: 8),
            Text('${_listing!.rating.toStringAsFixed(1)} (${_listing!.reviews.length} avaliações)', style: theme.textTheme.titleLarge),
          ],
        ),
        const SizedBox(height: 16),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _listing!.reviews.length > 2 ? 2 : _listing!.reviews.length, // Show max 2 initially
          itemBuilder: (context, index) {
            final review = _listing!.reviews[index];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundImage: CachedNetworkImageProvider(review.userAvatarUrl),
                      radius: 16,
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(review.userName, style: theme.textTheme.titleSmall),
                        Text(DateFormat('MMMM yyyy', 'pt_BR').format(review.date), style: theme.textTheme.bodySmall),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 4),
                StarRating(rating: review.rating, size: 14, showText: false),
                const SizedBox(height: 4),
                Text(review.comment, style: theme.textTheme.bodyMedium, maxLines: 3, overflow: TextOverflow.ellipsis),
              ],
            );
          },
          separatorBuilder: (context, index) => const Divider(height: 24),
        ),
        if (_listing!.reviews.length > 2)
          Padding(
            padding: const EdgeInsets.only(top: 12.0),
            child: OutlinedButton(
              onPressed: () { /* TODO: Navigate to all reviews screen */ },
              child: Text('Mostrar todas as ${_listing!.reviews.length} avaliações'),
            ),
          ),
      ],
    );
  }

  Widget _buildRentButton(BuildContext context, NumberFormat currencyFormatter) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16.0).copyWith(bottom: MediaQuery.of(context).padding.bottom + 16), // Respect safe area
      decoration: BoxDecoration(
        color: theme.bottomSheetTheme.backgroundColor ?? theme.scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
        border: Border(top: BorderSide(color: theme.dividerColor, width: 0.5))
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                currencyFormatter.format(_listing!.pricePerMonth),
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              Text('/ mês (aprox.)', style: theme.textTheme.bodySmall),
            ],
          ),
          ElevatedButton.icon(
            icon: _isRenting 
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Icon(_listing!.isRented ? LucideIcons.checkCircle : LucideIcons.home, size: 18),
            label: Text(_listing!.isRented ? 'Alugado' : 'Alugar Quarto'),
            onPressed: (_listing!.isRented || _isRenting) ? null : _handleRent,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              backgroundColor: _listing!.isRented ? theme.colorScheme.tertiary : theme.colorScheme.primary,
              disabledBackgroundColor: _listing!.isRented ? theme.colorScheme.tertiary.withOpacity(0.7) : theme.colorScheme.primary.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}
