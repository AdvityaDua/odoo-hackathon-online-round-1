import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/foundation.dart'; // for kIsWeb

class ApiClient {
  static const String baseUrl =
      'https://<your-vercel-project>.vercel.app/api/accounts/';

  late final Dio _dio;
  late final CookieJar _cookieJar;
  String? _accessToken;

  // Singleton pattern
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        contentType: Headers.jsonContentType,
        responseType: ResponseType.json,
      ),
    );

    _initCookieJar();
    _setupInterceptors();
  }

  void _initCookieJar() async {
    if (!kIsWeb) {
      final appDocDir = await getApplicationDocumentsDirectory();
      _cookieJar = PersistCookieJar(
        storage: FileStorage("${appDocDir.path}/.cookies/"),
      );
    } else {
      _cookieJar = CookieJar();
    }
    _dio.interceptors.add(CookieManager(_cookieJar));
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Attach Access Token if available
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }
          // Ensure credentials are treated as included (important for Web CORS mostly, but implicit here)
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // Handle 401 Unauthorized - Refresh Token
          if (e.response?.statusCode == 401 && _accessToken != null) {
            // Avoid infinite loops: if request was already to refresh, fail.
            if (e.requestOptions.path.contains('/refresh')) {
              _accessToken = null; // Clear invalid token
              // Optionally clear cookies
              return handler.next(e);
            }

            try {
              // Attempt to refresh
              final newAccessToken = await _refreshToken();
              if (newAccessToken != null) {
                // Retry original request with new token
                _accessToken = newAccessToken;
                final options = e.requestOptions;
                options.headers['Authorization'] = 'Bearer $newAccessToken';

                final retryResponse = await _dio.fetch(options);
                return handler.resolve(retryResponse);
              }
            } catch (err) {
              // Refresh failed
              _accessToken = null;
              return handler.next(e);
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

  Future<String?> _refreshToken() async {
    try {
      // Helper specific dio instance to avoid interceptor loops if needed,
      // but here we just made sure we don't catch /refresh in onError.
      // We MUST send cookies. CookieManager deals with it.
      final response = await _dio.post('/refresh/');

      if (response.statusCode == 200) {
        final data = response.data;
        return data['access'] ?? data['access_token'];
      }
    } catch (e) {
      debugPrint("Token Refresh Failed: $e");
    }
    return null;
  }

  // Public Getters and Setters
  Dio get dio => _dio;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  String? get accessToken => _accessToken;

  Future<void> clearSession() async {
    _accessToken = null;
    await _cookieJar.deleteAll();
  }
}
