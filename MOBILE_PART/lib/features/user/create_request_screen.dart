import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../features/auth/auth_view_model.dart';
import 'create_request_view_model.dart';
import '../../core/models/equipment_model.dart';
import '../../core/constants/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();

  String? _selectedEquipmentId;
  Priority _selectedPriority = Priority.medium;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CreateRequestViewModel>().loadEquipment();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedEquipmentId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select equipment')),
        );
        return;
      }

      final authVM = context.read<AuthViewModel>();
      final user = authVM.currentUser;
      if (user == null) return;

      final vm = context.read<CreateRequestViewModel>();
      final success = await vm.submitRequest(
        title: _titleController.text.trim(),
        description: _descController.text.trim(),
        equipmentId: _selectedEquipmentId!,
        userId: user.id,
        priority: _selectedPriority,
      );

      if (success && mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Maintenance request submitted successfully'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<CreateRequestViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Service Request'),
        centerTitle: true,
      ),
      body: viewModel.isLoading && viewModel.equipmentList.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Report a maintenance issue or request service for specific equipment.',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 32),
                    _buildTextField(
                      controller: _titleController,
                      label: 'Issue Title',
                      hint: 'e.g., Vibrations in main motor',
                      icon: Icons.report_problem_outlined,
                      validator: (v) =>
                          v!.isEmpty ? 'Please specify a title' : null,
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      value: _selectedEquipmentId,
                      decoration: _inputDecoration(
                        'Select Equipment',
                        Icons.settings_outlined,
                      ),
                      items: viewModel.equipmentList.map((e) {
                        return DropdownMenuItem(
                          value: e.id,
                          child: Text(e.name, overflow: TextOverflow.ellipsis),
                        );
                      }).toList(),
                      onChanged: (val) =>
                          setState(() => _selectedEquipmentId = val),
                      validator: (v) =>
                          v == null ? 'Equipment is required' : null,
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<Priority>(
                      value: _selectedPriority,
                      decoration: _inputDecoration(
                        'Urgency Level',
                        Icons.priority_high,
                      ),
                      items: Priority.values.map((p) {
                        return DropdownMenuItem(
                          value: p,
                          child: Text(p.name.toUpperCase()),
                        );
                      }).toList(),
                      onChanged: (val) =>
                          setState(() => _selectedPriority = val!),
                    ),
                    const SizedBox(height: 20),
                    _buildTextField(
                      controller: _descController,
                      label: 'Problem Description',
                      hint:
                          'Provide as much detail as possible about the issue...',
                      icon: Icons.description_outlined,
                      maxLines: 5,
                      validator: (v) =>
                          v!.isEmpty ? 'Description is required' : null,
                    ),
                    const SizedBox(height: 40),
                    if (viewModel.errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 20),
                        child: Text(
                          viewModel.errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                    ElevatedButton(
                      onPressed: viewModel.isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: viewModel.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Submit Request',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      filled: true,
      fillColor: Colors.grey[50],
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[200]!),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      decoration: _inputDecoration(label, icon).copyWith(hintText: hint),
      validator: validator,
    );
  }
}
