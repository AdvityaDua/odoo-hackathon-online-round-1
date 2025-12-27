import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/constants/app_colors.dart';
import 'core/models/user_model.dart';
import 'core/widgets/role_guard.dart';

import 'features/auth/auth_view_model.dart';
import 'features/auth/login_screen.dart';

import 'features/admin/admin_dashboard_screen.dart';
import 'features/admin/admin_dashboard_view_model.dart';

import 'features/user/user_dashboard_view_model.dart';
import 'features/user/user_home_scaffold.dart';
import 'features/user/calendar_view_model.dart';

import 'features/technician/technician_dashboard_screen.dart';
import 'features/technician/technician_dashboard_view_model.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GearGuardApp());
}

class GearGuardApp extends StatelessWidget {
  const GearGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthViewModel()),
        ChangeNotifierProvider(create: (_) => UserDashboardViewModel()),
        ChangeNotifierProvider(create: (_) => CalendarViewModel()),
        ChangeNotifierProvider(create: (_) => AdminDashboardViewModel()),
        ChangeNotifierProvider(create: (_) => TechnicianDashboardViewModel()),
      ],
      child: MaterialApp(
        title: 'GearGuard',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            secondary: AppColors.secondary,
            surface: AppColors.background,
            error: AppColors.error,
          ),
          textTheme: GoogleFonts.interTextTheme(),
          appBarTheme: const AppBarTheme(
            centerTitle: false,
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
            elevation: 0,
          ),
          scaffoldBackgroundColor: AppColors.background,
        ),
        routes: {
          '/': (context) => const AuthWrapper(),
          '/login': (context) => const LoginScreen(),

          '/employee': (context) => const RoleGuard(
            allowedRoles: [UserRole.user],
            child: UserHomeScaffold(),
          ),

          '/technician': (context) => const RoleGuard(
            allowedRoles: [UserRole.technician],
            child: TechnicianDashboardScreen(),
          ),

          '/manager': (context) => const RoleGuard(
            allowedRoles: [UserRole.admin],
            child: AdminDashboardScreen(),
          ),
        },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    debugPrint('AuthWrapper build called');
    final authViewModel = context.watch<AuthViewModel>();

    if (!authViewModel.isAuthenticated) {
      debugPrint('Not authenticated, showing LoginScreen');
      return const LoginScreen();
    }

    final user = authViewModel.currentUser;
    if (user == null) {
      debugPrint('User is null, showing LoginScreen');
      return const LoginScreen();
    }

    debugPrint('User role: ${user.role}');

    switch (user.role) {
      case UserRole.user:
        return const UserHomeScaffold();
      case UserRole.technician:
        return const TechnicianDashboardScreen();
      case UserRole.admin:
        return const AdminDashboardScreen();
    }
  }
}
