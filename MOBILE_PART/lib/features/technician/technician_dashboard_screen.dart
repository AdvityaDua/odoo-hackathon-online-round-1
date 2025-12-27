import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'technician_dashboard_view_model.dart';
import '../../features/auth/auth_view_model.dart';
import 'equipment_details_screen.dart';
import 'equipment_details_view_model.dart';
import '../../core/models/equipment_model.dart';
import '../../core/models/maintenance_request_model.dart';
import '../../core/constants/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';

class TechnicianDashboardScreen extends StatefulWidget {
  const TechnicianDashboardScreen({super.key});

  @override
  State<TechnicianDashboardScreen> createState() =>
      _TechnicianDashboardScreenState();
}

class _TechnicianDashboardScreenState extends State<TechnicianDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthViewModel>().currentUser;
      if (user != null) {
        context.read<TechnicianDashboardViewModel>().loadTasks(user.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<TechnicianDashboardViewModel>();
    final user = context.watch<AuthViewModel>().currentUser;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Technician Portal',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600]),
            ),
            Text(
              user?.email ?? 'My Tasks',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => context.read<AuthViewModel>().logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: viewModel.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => viewModel.loadTasks(user?.id ?? ''),
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: _buildSummaryOverview(viewModel.tasks),
                    ),
                  ),
                  if (viewModel.tasks.isEmpty)
                    const SliverFillRemaining(
                      child: Center(child: Text('No assigned tasks.')),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate((ctx, i) {
                        final task = viewModel.tasks[i];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          child: _buildTaskCard(task),
                        );
                      }, childCount: viewModel.tasks.length),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryOverview(List<MaintenanceRequest> tasks) {
    final active = tasks
        .where((t) => t.status == RequestStatus.inProgress)
        .length;
    final assigned = tasks
        .where((t) => t.status == RequestStatus.assigned)
        .length;

    return Row(
      children: [
        _buildStatBox('In Progress', active.toString(), Colors.purple),
        const SizedBox(width: 12),
        _buildStatBox('New Tasks', assigned.toString(), Colors.blue),
      ],
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskCard(MaintenanceRequest task) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _viewDetails(task.equipmentId),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatusChip(task.status),
                  _buildPriorityBadge(task.priority),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                task.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.business, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    task.workCenterId ?? 'Main Plant',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Icon(
                    Icons.precision_manufacturing,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    task.equipmentName ?? 'Equipment',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const Spacer(),
                  const Text(
                    'View Details',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _viewDetails(String equipmentId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider(
          create: (_) => EquipmentDetailsViewModel(),
          child: EquipmentDetailsScreen(equipmentId: equipmentId),
        ),
      ),
    );
  }

  Widget _buildStatusChip(RequestStatus status) {
    Color color;
    switch (status) {
      case RequestStatus.pending:
        color = Colors.orange;
        break;
      case RequestStatus.assigned:
        color = Colors.blue;
        break;
      case RequestStatus.inProgress:
        color = Colors.purple;
        break;
      case RequestStatus.completed:
        color = Colors.green;
        break;
      case RequestStatus.cancelled:
        color = Colors.grey;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
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

  Widget _buildPriorityBadge(Priority priority) {
    Color color;
    switch (priority) {
      case Priority.critical:
        color = Colors.red;
        break;
      case Priority.high:
        color = Colors.orange;
        break;
      case Priority.medium:
        color = Colors.blue;
        break;
      case Priority.low:
        color = Colors.green;
        break;
    }
    return Text(
      priority.name.toUpperCase(),
      style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
    );
  }
}
