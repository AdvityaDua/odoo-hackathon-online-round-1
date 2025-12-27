import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/maintenance_request_model.dart';

class UserDashboardViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<MaintenanceRequest> _requests = [];
  List<MaintenanceRequest> get requests => _requests;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // Initialize
  Future<void> loadDashboard(String userId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _requests = await _dataService.getRequests(requesterId: userId);
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}
