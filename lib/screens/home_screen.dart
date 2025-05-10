import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/screens/explore_screen.dart';
import 'package:alugo/screens/bookings_screen.dart';
import 'package:alugo/screens/profile/profile_screen.dart';
import 'package:alugo/widgets/bottom_navigation_bar.dart';

class HomeScreen extends StatefulWidget {
  static const routeName = '/home';
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    ExploreScreen(),
    BookingsScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Consider haptic feedback here if desired
    // HapticFeedback.lightImpact();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack( // Using IndexedStack to preserve state of each tab
        index: _selectedIndex,
        children: _widgetOptions,
      ),
      bottomNavigationBar: CustomBottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationItem(icon: LucideIcons.compass, label: 'Explorar'),
          BottomNavigationItem(icon: LucideIcons.calendarCheck, label: 'Reservas'),
          BottomNavigationItem(icon: LucideIcons.userCircle2, label: 'Perfil'),
        ],
      ),
    );
  }
}
