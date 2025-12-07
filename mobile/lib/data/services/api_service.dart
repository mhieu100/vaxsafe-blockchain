import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../core/constants/app_constants.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator to access localhost
  // Use localhost for iOS simulator
  static String get baseUrl {
    if (Platform.isAndroid) {
      return dotenv.env['API_BASE_URL_ANDROID'];
    }
    return dotenv.env['API_BASE_URL_IOS'];
  }

  String? _accessToken;

  String? get accessToken => _accessToken;

  void setAccessToken(String token) {
    _accessToken = token;
  }

  // Returns a Map containing accessToken and User object
  Future<Map<String, dynamic>> loginGoogleMobile(String idToken) async {
    final url = Uri.parse('$baseUrl/login/google-mobile');
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        Map<String, dynamic> data;
        
        // Handle wrapped response (statusCode, message, data)
        if (body.containsKey('data') && body['data'] != null) {
          data = Map<String, dynamic>.from(body['data']);
        } else {
          data = body;
        }

        if (data['accessToken'] != null) {
          _accessToken = data['accessToken'];
        }
        
        // Convert user part to UserModel if possible, but for flexible return keeping Map for now 
        // or we can parse it here. Let's return the raw data map 
        // but ensure 'user' key is effectively a Map to be parsed by UI.
        return data; 
      } else {
        throw Exception('Failed to login: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error connecting to backend: $e');
    }
  }

  Future<UserModel> completeProfile(Map<String, dynamic> profileData) async {
    if (_accessToken == null) {
      throw Exception('No access token available. Please login first.');
    }

    final url = Uri.parse('$baseUrl/complete-profile');
    
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_accessToken',
        },
        body: jsonEncode(profileData),
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        Map<String, dynamic> userDataMap;

        // Handle wrapped response
        if (body.containsKey('data') && body['data'] != null) {
          userDataMap = Map<String, dynamic>.from(body['data']);
        } else {
          userDataMap = body;
        }
        
        return UserModel.fromJson(userDataMap);
      } else {
        throw Exception('Failed to complete profile: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error connecting to backend: $e');
    }
  }

  Future<void> logout() async {
    try {
      if (_accessToken != null) {
        final url = Uri.parse('$baseUrl/logout');
        await http.post(
          url,
          headers: {
            'Authorization': 'Bearer $_accessToken',
          },
        );
      }
    } catch (e) {
      // Ignore errors during logout, just proceed to clear local state
      print("Error during backend logout: $e");
    } finally {
      _accessToken = null;
    }
  }
}
