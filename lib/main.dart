import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:alugo/providers/auth_provider.dart';
import 'package:alugo/screens/login_screen.dart';
import 'package:alugo/screens/home_screen.dart'; // This will be the main screen with BottomNav
import 'package:alugo/utils/theme.dart';
import 'package:alugo/services/mock_data.dart'; // Initialize mock data

void main() {
  initializeMockData(); // Initialize mock listings and other data
  runApp(const AlugoApp());
}

class AlugoApp extends StatelessWidget {
  const AlugoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AuthProvider(),
      child: MaterialApp(
        title: 'Alugo',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system, // Or allow user to choose
        debugShowCheckedModeBanner: false,
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.isLoadingAuth) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            return auth.isAuthenticated ? const HomeScreen() : const LoginScreen();
          },
        ),
        // For more complex navigation, consider go_router
        // routes: {
        //   LoginScreen.routeName: (ctx) => LoginScreen(),
        //   HomeScreen.routeName: (ctx) => HomeScreen(),
        //   // Define other routes here
        // },
      ),
    );
  }
}
