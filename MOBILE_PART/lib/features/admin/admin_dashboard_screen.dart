import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'admin_dashboard_view_model.dart';
import '../../features/auth/auth_view_model.dart';
import '../../core/models/equipment_model.dart';
import '../../core/constants/app_colors.dart';
import 'add_equipment_screen.dart';
import 'add_equipment_view_model.dart';
import 'package:google_fonts/google_fonts.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminDashboardViewModel>().loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<AdminDashboardViewModel>();
    final user = context.watch<AuthViewModel>().currentUser;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Administrator Console',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600]),
            ),
            Text(
              user?.name ?? 'Management',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () =>
                context.read<AdminDashboardViewModel>().loadDashboard(),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            onPressed: () => context.read<AuthViewModel>().logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToAddEquipment(context),
        icon: const Icon(Icons.add),
        label: const Text('Add Asset'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: viewModel.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => viewModel.loadDashboard(),
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: _buildAssetSummary(viewModel.equipmentList),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverToBoxAdapter(
                      child: Text(
                        'Equipment Inventory (${viewModel.equipmentList.length})',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 12)),
                  if (viewModel.equipmentList.isEmpty)
                    const SliverFillRemaining(
                      child: Center(child: Text('No equipment found.')),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate((ctx, i) {
                        final eq = viewModel.equipmentList[i];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          child: _buildEquipmentCard(eq),
                        );
                      }, childCount: viewModel.equipmentList.length),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 80)),
                ],
              ),
            ),
    );
  }

  Future<void> _navigateToAddEquipment(BuildContext context) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider(
          create: (_) => AddEquipmentViewModel(),
          child: const AddEquipmentScreen(),
        ),
      ),
    );
    if (result == true) {
      context.read<AdminDashboardViewModel>().loadDashboard();
    }
  }

  Widget _buildAssetSummary(List<Equipment> equipment) {
    final operational = equipment
        .where((e) => e.status == EquipmentStatus.operational)
        .length;
    final maintenance = equipment
        .where((e) => e.status == EquipmentStatus.maintenanceRequired)
        .length;
    final down = equipment
        .where((e) => e.status == EquipmentStatus.down)
        .length;

    return Row(
      children: [
        _buildStatCard('Operational', operational.toString(), Colors.green),
        const SizedBox(width: 8),
        _buildStatCard('Maintenance', maintenance.toString(), Colors.orange),
        const SizedBox(width: 8),
        _buildStatCard('Down', down.toString(), Colors.red),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEquipmentCard(Equipment eq) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: _getStatusColor(eq.status).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getStatusIcon(eq.status),
            color: _getStatusColor(eq.status),
          ),
        ),
        title: Text(
          eq.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'S/N: ${eq.serialNumber}',
              style: const TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 4),
            _buildStatusBadge(eq.status),
          ],
        ),
        trailing: const Icon(Icons.more_vert),
        onTap: () {}, // Could go to details or edit
      ),
    );
  }

  Widget _buildStatusBadge(EquipmentStatus status) {
    final color = _getStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
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

  IconData _getStatusIcon(EquipmentStatus status) {
    switch (status) {
      case EquipmentStatus.operational:
        return Icons.check_circle_outline;
      case EquipmentStatus.maintenanceRequired:
        return Icons.build_circle_outlined;
      case EquipmentStatus.down:
        return Icons.error_outline;
    }
  }
}
