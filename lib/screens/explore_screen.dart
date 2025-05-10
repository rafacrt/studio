import 'package:flutter/material.dart';
import 'package:alugo/services/mock_data.dart';
import 'package:alugo/models/listing_model.dart';
import 'package:alugo/widgets/listing_card.dart';
import 'package:alugo/screens/room_detail_screen.dart';
import 'package:lucide_flutter/lucide_flutter.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  List<Listing> _listings = [];
  List<Listing> _filteredListings = [];
  bool _isLoading = true;
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadListings();
    _scrollController.addListener(_onScroll);
    _searchController.addListener(_onSearchChanged);
  }

  Future<void> _loadListings({bool isRefresh = false}) async {
    if (isRefresh) {
      _currentPage = 1;
      _listings.clear();
      _filteredListings.clear();
      _hasMore = true;
    }
    if (_isLoading || !_hasMore) return;

    setState(() {
      _isLoading = true;
    });

    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 700));
    final newItems =
        await MockDataService.fetchListings(page: _currentPage, limit: 9);

    setState(() {
      _listings.addAll(newItems);
      _applySearchFilter(); // Apply current search term to the newly loaded list
      _currentPage++;
      _hasMore = newItems.length == 9;
      _isLoading = false;
    });
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 && // Trigger a bit before the end
        !_isLoading &&
        _hasMore) {
      _loadListings();
    }
  }

  void _onSearchChanged() {
    _applySearchFilter();
  }

  void _applySearchFilter() {
    final searchTerm = _searchController.text.toLowerCase();
    if (searchTerm.isEmpty) {
      setState(() {
        _filteredListings = List.from(_listings);
      });
    } else {
      setState(() {
        _filteredListings = _listings.where((listing) {
          return listing.title.toLowerCase().contains(searchTerm) ||
              listing.description.toLowerCase().contains(searchTerm) ||
              listing.address.toLowerCase().contains(searchTerm) ||
              listing.universityName.toLowerCase().contains(searchTerm) ||
              listing.universityAcronym.toLowerCase().contains(searchTerm);
        }).toList();
      });
    }
  }


  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explorar Quartos'),
        toolbarHeight: 80, // Increased height for search bar
        flexibleSpace: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 50.0, 16.0, 8.0), // Adjust padding
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar por bairro, cidade, universidade...',
                prefixIcon: const Icon(LucideIcons.search, size: 20),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(25.0),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
              ),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _loadListings(isRefresh: true),
        child: _buildListingView(),
      ),
    );
  }

  Widget _buildListingView() {
    if (_isLoading && _filteredListings.isEmpty && _listings.isEmpty) {
      return GridView.builder(
        padding: const EdgeInsets.all(12.0),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 1, // Single column on mobile for better readability
          childAspectRatio: 16 / 10, // Adjust aspect ratio
          crossAxisSpacing: 12.0,
          mainAxisSpacing: 12.0,
        ),
        itemCount: 6, // Number of skeleton items
        itemBuilder: (context, index) => const ListingCardSkeleton(),
      );
    }

    if (_filteredListings.isEmpty && _searchController.text.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Nenhum quarto encontrado para "${_searchController.text}".',
            style: Theme.of(context).textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    
    if (_filteredListings.isEmpty && _listings.isEmpty && !_isLoading) {
       return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.searchX, size: 48, color: Colors.grey),
              const SizedBox(height: 16),
              Text(
                'Nenhum quarto disponível no momento.',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                icon: const Icon(LucideIcons.refreshCw),
                label: const Text('Tentar Novamente'),
                onPressed: () => _loadListings(isRefresh: true),
              )
            ],
          ),
        ),
      );
    }


    return GridView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(12.0),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 600 ? 2 : 1, // 2 columns for tablets
        childAspectRatio: MediaQuery.of(context).size.width > 600 ? 4/3 : 16/10, // Aspect ratio
        crossAxisSpacing: 12.0,
        mainAxisSpacing: 12.0,
      ),
      itemCount: _filteredListings.length + (_hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _filteredListings.length) {
          return _isLoading 
            ? const Center(child: Padding(
                padding: EdgeInsets.all(8.0),
                child: CircularProgressIndicator(strokeWidth: 3,),
              ))
            : const SizedBox.shrink(); // Or a "load more" button
        }
        final listing = _filteredListings[index];
        return ListingCard(
          listing: listing,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => RoomDetailScreen(listingId: listing.id),
              ),
            );
          },
        );
      },
    );
  }
}
