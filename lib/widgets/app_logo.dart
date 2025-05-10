import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:alugo/utils/colors.dart'; // Assuming your colors are defined here

class AppLogo extends StatelessWidget {
  final double fontSize;
  final Color? color; // Allow custom color override

  const AppLogo({
    super.key,
    this.fontSize = 38.0,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    // Determine if dark mode is active to select gradient colors
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = color ?? (isDarkMode ? kDarkPrimary : kLightPrimary);
    final accentColor = color ?? (isDarkMode ? kDarkAccent : kLightAccent);

    return ShaderMask(
      shaderCallback: (bounds) => LinearGradient(
        colors: [primaryColor, accentColor],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(bounds),
      child: Text(
        'Alugo',
        style: GoogleFonts.inter( // Or your chosen font for the logo
          fontSize: fontSize,
          fontWeight: FontWeight.bold,
          color: Colors.white, // This color will be masked by the gradient
        ),
      ),
    );
  }
}
