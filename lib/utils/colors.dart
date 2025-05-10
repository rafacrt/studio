import 'package:flutter/material.dart';

// Based on HSL values from globals.css and proposal
// Light Theme Colors
const Color kLightPrimary = Color(0xFF2B81EC); // Blue - hsl(217, 91%, 60%)
const Color kLightPrimaryForeground = Colors.white;
const Color kLightBackground = Color(0xFFF2F2F7); // Light Gray - hsl(220, 13%, 97%)
const Color kLightForeground = Color(0xFF1C1C1E); // Dark Gray Text - hsl(240, 10%, 3.9%) approx.
const Color kLightCard = Colors.white;
const Color kLightCardForeground = Color(0xFF1C1C1E);
const Color kLightSecondary = Color(0xFFE5E5EA); // Lighter Gray - hsl(240, 5%, 90%)
const Color kLightSecondaryForeground = Color(0xFF1C1C1E);
const Color kLightMuted = Color(0xFFEBEBF0); // hsl(240, 5%, 93%)
const Color kLightMutedForeground = Color(0xFF8E8E93); // hsl(240, 4%, 46%) approx.
const Color kLightAccent = Color(0xFF34C759); // Green - hsl(142, 71%, 45%)
const Color kLightAccentForeground = Colors.white;
const Color kLightDestructive = Color(0xFFFF3B30); // hsl(0, 84.2%, 60.2%) approx.
const Color kLightBorder = Color(0xFFD1D1D6); // hsl(240, 6%, 88%) approx.
const Color kLightInput = Color(0xFFE5E5EA); // hsl(240, 6%, 90%)

// Dark Theme Colors
const Color kDarkPrimary = Color(0xFF2B81EC); // Blue
const Color kDarkPrimaryForeground = Colors.white;
const Color kDarkBackground = Color(0xFF1C1C1E); // Dark Gray - hsl(240, 6%, 10%) approx.
const Color kDarkForeground = Color(0xFFF2F2F7); // Light Gray Text
const Color kDarkCard = Color(0xFF2C2C2E); // hsl(240, 6%, 12%) approx.
const Color kDarkCardForeground = Color(0xFFF2F2F7);
const Color kDarkSecondary = Color(0xFF3A3A3C); // hsl(240, 4%, 16%) approx.
const Color kDarkSecondaryForeground = Color(0xFFF2F2F7);
const Color kDarkMuted = Color(0xFF48484A); // hsl(240, 4%, 18%) approx.
const Color kDarkMutedForeground = Color(0xFF98989D); // hsl(0, 0%, 60%) approx.
const Color kDarkAccent = Color(0xFF34C759); // Green
const Color kDarkAccentForeground = Colors.white;
const Color kDarkDestructive = Color(0xFFFF453A); // hsl(0, 62.8%, 30.6%) approx. (made brighter for visibility)
const Color kDarkBorder = Color(0xFF48484A); // hsl(240, 4%, 20%) approx.
const Color kDarkInput = Color(0xFF545458); // hsl(240, 4%, 22%) approx.

// Chart Colors (can be defined here or in theme)
const Color kChartColor1 = Color(0xFFF48A7B); // hsl(12, 76%, 61%)
const Color kChartColor2 = Color(0xFF3E9B82); // hsl(173, 58%, 39%)
const Color kChartColorActive = kLightAccent; // Green
const Color kChartColorPast = kLightMutedForeground;
const Color kChartColorCancelled = kLightDestructive;
