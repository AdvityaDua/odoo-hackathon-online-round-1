import '../api/api_client.dart';
import '../models/user_model.dart';
import 'package:dio/dio.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  // Login
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _apiClient.dio.post(
        '/login/',
        data: {'email': email, 'password': password},
      );

      final data = response.data;
      final String accessToken = data['access'] ?? data['access_token'];
      _apiClient.setAccessToken(accessToken);

      // Extract User Data
      // Assuming API returns user object in response, or we decode JWT.
      // The prompt says "Extract and store user object". Usually returned in login response.
      // If not, we might need to fetch /me. Assuming structure based on prompt "Response Body -> access token... Extract and store user object".
      // Let's assume response: { "access": "...", "user": { ... } }
      if (data['user'] == null) {
        throw Exception("Invalid response: User data missing");
      }

      return UserModel.fromJson(data['user']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Register
  Future<void> register({
    required String email,
    required String password,
    required String role, // user, technician, admin
    String? adminSecret,
    String? department,
  }) async {
    try {
      final Map<String, dynamic> body = {
        'email': email,
        'password': password,
        'role': role,
        if (department != null) 'department': department,
        if (role == 'admin') 'admin_secret': adminSecret,
      };

      await _apiClient.dio.post('/register/', data: body);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _apiClient.dio.post('/logout/');
    } catch (e) {
      // Ignore errors on logout
    } finally {
      await _apiClient.clearSession();
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      // Try to parse API error message
      final data = e.response?.data;
      if (data is Map && data.containsKey('detail')) {
        return data['detail'];
      }
      if (data is Map && data.containsKey('message')) {
        return data['message'];
      }
    }
    return e.message ?? 'An unknown error occurred';
  }
}
