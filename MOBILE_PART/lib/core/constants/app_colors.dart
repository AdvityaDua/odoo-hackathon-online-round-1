import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF1565C0); // Blue 800 - Enterprise Blue
  static const Color primaryDark = Color(0xFF0D47A1);
  static const Color secondary = Color(0xFF263238); // Blue Grey 900
  static const Color background = Color(0xFFF5F7FA); // Light Blueish Grey
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFB00020);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color inputBorder = Color(0xFFE0E0E0);
  
  static const LinearGradient loginGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFE3F2FD), // Blue 50
      Color(0xFFBBDEFB), // Blue 100
    ],
  );
}
