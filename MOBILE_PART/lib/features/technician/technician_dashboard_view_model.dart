import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/maintenance_request_model.dart';

class TechnicianDashboardViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<MaintenanceRequest> _tasks = [];
  List<MaintenanceRequest> get tasks => _tasks;
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadTasks(String techId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _tasks = await _dataService.getRequests(technicianId: techId);
    } catch (e) {
      debugPrint("Error: $e");
    }
    _isLoading = false;
    notifyListeners();
  }
}
