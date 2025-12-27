import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'equipment_details_view_model.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/models/equipment_model.dart';

class EquipmentDetailsScreen extends StatefulWidget {
  final String equipmentId;

  const EquipmentDetailsScreen({super.key, required this.equipmentId});

  @override
  State<EquipmentDetailsScreen> createState() => _EquipmentDetailsScreenState();
}

class _EquipmentDetailsScreenState extends State<EquipmentDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EquipmentDetailsViewModel>().loadEquipment(
        widget.equipmentId,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<EquipmentDetailsViewModel>();
    final eq = viewModel.equipment;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(title: const Text('Asset Information'), centerTitle: true),
      body: viewModel.isLoading
          ? const Center(child: CircularProgressIndicator())
          : eq == null
          ? const Center(child: Text("Equipment not found."))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildImageHeader(eq),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTitleSection(eq),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Technical Specifications'),
                        const SizedBox(height: 12),
                        _buildSpecGrid(eq),
                        const SizedBox(height: 32),
                        _buildSectionTitle('Maintenance History'),
                        const SizedBox(height: 12),
                        _buildHistoryList(viewModel),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildImageHeader(Equipment eq) {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1)),
      child: eq.imageUrl.isNotEmpty
          ? Image.network(eq.imageUrl, fit: BoxFit.cover)
          : const Icon(
              Icons.precision_manufacturing,
              size: 80,
              color: AppColors.primary,
            ),
    );
  }

  Widget _buildTitleSection(Equipment eq) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                eq.name,
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            _buildStatusBadge(eq.status),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          eq.description.isNotEmpty
              ? eq.description
              : "No description provided.",
          style: TextStyle(color: Colors.grey[600], height: 1.5),
        ),
      ],
    );
  }

  Widget _buildSpecGrid(Equipment eq) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          _buildSpecRow(Icons.qr_code, 'Serial Number', eq.serialNumber),
          const Divider(height: 24),
          _buildSpecRow(Icons.category_outlined, 'Category', eq.categoryId),
          const Divider(height: 24),
          _buildSpecRow(
            Icons.calendar_today_outlined,
            'Last Inspected',
            '2025-10-15',
          ),
        ],
      ),
    );
  }

  Widget _buildSpecRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        const Spacer(),
        Text(
          value,
          style: TextStyle(
            color: Colors.grey[600],
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryList(EquipmentDetailsViewModel viewModel) {
    if (viewModel.history.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Column(
          children: [
            Icon(Icons.history, color: Colors.grey, size: 40),
            SizedBox(height: 12),
            Text(
              'No history records found.',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: viewModel.history.length,
      itemBuilder: (ctx, i) {
        final req = viewModel.history[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey[200]!),
          ),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: const Icon(
                Icons.build_circle_outlined,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            title: Text(
              req.title,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              DateFormat('MMM d, yyyy').format(req.createdAt),
              style: const TextStyle(fontSize: 12),
            ),
            trailing: _buildSmallStatusChip(req.status.name),
          ),
        );
      },
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildStatusBadge(EquipmentStatus status) {
    Color color = _getStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSmallStatusChip(String status) {
    Color color = Colors.grey;
    if (status.toLowerCase().contains('completed')) color = Colors.green;
    if (status.toLowerCase().contains('progress')) color = Colors.purple;
    if (status.toLowerCase().contains('pending')) color = Colors.orange;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.toUpperCase(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getStatusColor(EquipmentStatus status) {
    switch (status) {
      case EquipmentStatus.operational:
        return Colors.green;
      case EquipmentStatus.maintenanceRequired:
        return Colors.orange;
      case EquipmentStatus.down:
        return Colors.red;
    }
  }
}
