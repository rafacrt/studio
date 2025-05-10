import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: kLightPrimary,
      scaffoldBackgroundColor: kLightBackground,
      fontFamily: GoogleFonts.inter().fontFamily, // Using Inter as a proxy for SF Pro
      colorScheme: const ColorScheme.light(
        primary: kLightPrimary,
        onPrimary: kLightPrimaryForeground,
        secondary: kLightSecondary,
        onSecondary: kLightSecondaryForeground,
        surface: kLightCard, // Card background
        onSurface: kLightCardForeground, // Text on card
        background: kLightBackground,
        onBackground: kLightForeground,
        error: kLightDestructive,
        onError: kLightPrimaryForeground,
        brightness: Brightness.light,
        tertiary: kLightAccent, // Accent color
        onTertiary: kLightAccentForeground,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: kLightBackground,
        elevation: 0,
        iconTheme: const IconThemeData(color: kLightForeground),
        titleTextStyle: GoogleFonts.inter(
          color: kLightForeground,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: kLightCard,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0), // iOS like rounded corners
        ),
        shadowColor: Colors.black.withOpacity(0.1),
        surfaceTintColor: Colors.transparent, // To prevent unwanted tinting
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: kLightInput,
        hintStyle: const TextStyle(color: kLightMutedForeground),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.0),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.0),
          borderSide: const BorderSide(color: kLightPrimary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: kLightPrimary,
          foregroundColor: kLightPrimaryForeground,
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          elevation: 2,
          shadowColor: kLightPrimary.withOpacity(0.3),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: kLightPrimary,
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: kLightBackground.withOpacity(0.9),
        selectedItemColor: kLightPrimary,
        unselectedItemColor: kLightMutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 8, // For shadow
        selectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(fontSize: 34, fontWeight: FontWeight.bold, color: kLightForeground),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: kLightForeground),
        headlineMedium: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: kLightForeground), // For titles
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: kLightForeground), // For card titles
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: kLightForeground),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: kLightMutedForeground), // For subtitles, descriptions
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: kLightPrimaryForeground), // For button text
      ),
      dividerTheme: const DividerThemeData(
        color: kLightBorder,
        thickness: 0.8,
      ),
      // Add other theme properties as needed
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      primaryColor: kDarkPrimary,
      scaffoldBackgroundColor: kDarkBackground,
      fontFamily: GoogleFonts.inter().fontFamily,
      colorScheme: const ColorScheme.dark(
        primary: kDarkPrimary,
        onPrimary: kDarkPrimaryForeground,
        secondary: kDarkSecondary,
        onSecondary: kDarkSecondaryForeground,
        surface: kDarkCard,
        onSurface: kDarkCardForeground,
        background: kDarkBackground,
        onBackground: kDarkForeground,
        error: kDarkDestructive,
        onError: kDarkPrimaryForeground,
        brightness: Brightness.dark,
        tertiary: kDarkAccent,
        onTertiary: kDarkAccentForeground,
      ),
       appBarTheme: AppBarTheme(
        backgroundColor: kDarkBackground,
        elevation: 0,
        iconTheme: const IconThemeData(color: kDarkForeground),
        titleTextStyle: GoogleFonts.inter(
          color: kDarkForeground,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: kDarkCard,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
         shadowColor: Colors.black.withOpacity(0.3),
         surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: kDarkInput,
        hintStyle: const TextStyle(color: kDarkMutedForeground),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.0),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.0),
          borderSide: const BorderSide(color: kDarkPrimary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
       elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: kDarkPrimary,
          foregroundColor: kDarkPrimaryForeground,
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          elevation: 2,
          shadowColor: kDarkPrimary.withOpacity(0.3),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: kDarkPrimary,
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: kDarkBackground.withOpacity(0.9),
        selectedItemColor: kDarkPrimary,
        unselectedItemColor: kDarkMutedForeground,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w500),
      ),
       textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(fontSize: 34, fontWeight: FontWeight.bold, color: kDarkForeground),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: kDarkForeground),
        headlineMedium: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: kDarkForeground),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: kDarkForeground),
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: kDarkForeground),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: kDarkMutedForeground),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: kDarkPrimaryForeground),
      ),
      dividerTheme: const DividerThemeData(
        color: kDarkBorder,
        thickness: 0.8,
      ),
    );
  }
}
