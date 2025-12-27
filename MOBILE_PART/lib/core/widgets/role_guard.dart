import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../../features/auth/auth_view_model.dart';
import '../../features/common/permission_denied_screen.dart';
import 'package:provider/provider.dart';

class RoleGuard extends StatelessWidget {
  final Widget child;
  final List<UserRole> allowedRoles;

  const RoleGuard({super.key, required this.child, required this.allowedRoles});

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<AuthViewModel>();
    final user = viewModel.currentUser;

    if (!viewModel.isAuthenticated || user == null) {
      // Not sure if this should redirect to login or show permission denied.
      // Usually if not auth -> login.
      // But this guard wraps a route. If we are here, we might have been redirected.
      // Ideally trigger logout/login redirect.
      // For now, denied screen or login.
      return const PermissionDeniedScreen(
        message: "Please login to access this page.",
      );
    }

    // Role Logic
    // If user is Admin, they generally have access (as per prompt "Managers can access all routes")
    // Wait, prompt says: "Managers can access all routes". "Admin" == "Manager" contextually.
    if (user.role == UserRole.admin) {
      return child;
    }

    if (allowedRoles.contains(user.role)) {
      return child;
    }

    return const PermissionDeniedScreen();
  }
}
