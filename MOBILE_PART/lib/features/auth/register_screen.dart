import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import 'auth_view_model.dart';
import '../../core/constants/dev_config.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _adminSecretController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _selectedRole = 'user'; // user, technician, admin

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _adminSecretController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      final viewModel = context.read<AuthViewModel>();

      final success = await viewModel.register(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        role: _selectedRole,
        adminSecret: _selectedRole == 'admin'
            ? _adminSecretController.text.trim()
            : null,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Please login.'),
          ),
        );
        Navigator.pop(context); // Return to login
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<AuthViewModel>();

    return Scaffold(
      appBar: AppBar(title: const Text("Register")),
      body: devAuthEnabled
          ? const Center(child: Text("Register disabled in DEV MODE"))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Create Account',
                      style: GoogleFonts.inter(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Email
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: (v) =>
                          v!.contains('@') ? null : 'Invalid email',
                    ),
                    const SizedBox(height: 16),

                    // Password
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock_outlined),
                      ),
                      validator: (v) =>
                          v!.length >= 6 ? null : 'Password too short',
                    ),
                    const SizedBox(height: 16),

                    // Role Dropdown
                    DropdownButtonFormField<String>(
                      // ignore: deprecated_member_use
                      value: _selectedRole,
                      decoration: const InputDecoration(
                        labelText: 'Role',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'user',
                          child: Text('Employee'),
                        ),
                        DropdownMenuItem(
                          value: 'technician',
                          child: Text('Technician'),
                        ),
                        DropdownMenuItem(
                          value: 'admin',
                          child: Text('Manager/Admin'),
                        ),
                      ],
                      onChanged: (val) {
                        setState(() => _selectedRole = val!);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Admin Secret Field
                    if (_selectedRole == 'admin')
                      TextFormField(
                        controller: _adminSecretController,
                        decoration: const InputDecoration(
                          labelText: 'Admin Secret Key',
                          prefixIcon: Icon(Icons.security),
                        ),
                        validator: (v) {
                          if (_selectedRole == 'admin' &&
                              (v == null || v.isEmpty)) {
                            return 'Admin secret required';
                          }
                          if (_selectedRole == 'admin' &&
                              v != "GEARGUARD_ADMIN_2025") {
                            return 'Invalid Admin Secret';
                          }
                          return null;
                        },
                      ),
                    if (_selectedRole == 'admin') const SizedBox(height: 16),

                    if (viewModel.errorMessage != null)
                      Text(
                        viewModel.errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),

                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: viewModel.isLoading ? null : _handleRegister,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: viewModel.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Register'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
