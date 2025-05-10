import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:alugo/models/user_model.dart';
import 'package:alugo/services/mock_data.dart'; // For mockUser, mockAdminUser

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoadingAuth = true;
  bool _isAnimatingLogin = false;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isLoadingAuth => _isLoadingAuth;
  bool get isAnimatingLogin => _isAnimatingLogin;

  AuthProvider() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString('alugoUser');
    if (userDataString != null) {
      _user = User.fromJson(json.decode(userDataString));
    }
    _isLoadingAuth = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoadingAuth = true;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 500));

      User foundUser;
      if (email == mockAdminUser.email) { // Simple check for admin
        foundUser = mockAdminUser;
      } else {
        // For any other email/password, log in as a dynamic mock user
        final userName = email.split('@')[0]
            .replaceAll(RegExp(r'[._0-9]'), ' ')
            .split(' ')
            .map((namePart) => namePart.isNotEmpty ? namePart[0].toUpperCase() + namePart.substring(1) : '')
            .join(' ');
        
        foundUser = User(
          id: 'user-${DateTime.now().millisecondsSinceEpoch}',
          email: email,
          name: userName.isNotEmpty ? userName : "Usuário",
          avatarUrl: 'https://picsum.photos/seed/${Uri.encodeComponent(email)}/100/100',
          isAdmin: false,
        );
      }

      _isAnimatingLogin = true;
      notifyListeners();
      await Future.delayed(const Duration(milliseconds: 1500)); // Animation duration

      _user = foundUser;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('alugoUser', json.encode(foundUser.toJson()));
      
      _isAnimatingLogin = false;
      _isLoadingAuth = false;
      notifyListeners();

    } catch (error) {
      _isAnimatingLogin = false;
      _isLoadingAuth = false;
      notifyListeners();
      rethrow; // Rethrow the error to be caught by the UI
    }
  }

  Future<void> logout() async {
    _user = null;
    _isAnimatingLogin = false; // Reset animation state
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('alugoUser');
    notifyListeners();
  }

  // Method to update user details (e.g., after profile edit)
  Future<void> updateUser(User updatedUser) async {
    _user = updatedUser;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('alugoUser', json.encode(updatedUser.toJson()));
    notifyListeners();
  }
}
