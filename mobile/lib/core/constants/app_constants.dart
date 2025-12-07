import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  // Colors
  static const Color primaryColor = Color(0xFF6A11CB);
  static const Color secondaryColor = Color(0xFF2575FC);
  static const Color textPrimary = Color(0xFF333333);
  static const Color textSecondary = Colors.grey;
  static const Color backgroundLight = Color(0xFFF5F7FA);
  static const Color backgroundDark = Color(0xFFC3CFE2);

  // Google Sign In
  static String get serverClientId => dotenv.env['GOOGLE_SERVER_CLIENT_ID'] ?? '';
}
