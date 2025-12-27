import 'package:flutter/material.dart';
import '../../core/auth/auth_service.dart';
import '../../core/models/user_model.dart';
import '../../core/api/api_client.dart';
import '../../core/constants/dev_config.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool get isAuthenticated =>
      _currentUser != null &&
      (devAuthEnabled || ApiClient().accessToken != null);

  // DEV MODE LOGIN
  void devLogin(UserRole role) {
    if (!devAuthEnabled) return;

    _currentUser = UserModel(
      id: 'dev_user_1',
      email: 'dev@gearguard.com',
      role: role,
      department: 'IT',
    );
    notifyListeners();
  }

  // Login Logic
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    if (devAuthEnabled) {
      // Mock login for manual entry if needed, defaulting to user
      devLogin(UserRole.user);
      _setLoading(false);
      return true;
    }

    try {
      _currentUser = await _authService.login(email, password);
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  // Register Logic
  Future<bool> register({
    required String email,
    required String password,
    required String role,
    String? adminSecret,
    String? department,
  }) async {
    _setLoading(true);
    if (devAuthEnabled) {
      // Mock register success
      _setLoading(false);
      return true;
    }

    try {
      await _authService.register(
        email: email,
        password: password,
        role: role,
        adminSecret: adminSecret,
        department: department,
      );
      // Automatically login? Usually register returns success, user must login.
      // We'll just return true so UI can navigate to Login.
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    _errorMessage = null;
    notifyListeners();
  }
}
