import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/equipment_model.dart';

class CreateRequestViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<Equipment> _equipmentList = [];
  List<Equipment> get equipmentList => _equipmentList;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  Future<void> loadEquipment() async {
    _isLoading = true;
    notifyListeners();
    try {
      _equipmentList = await _dataService.getEquipment();
    } catch (e) {
      _errorMessage = "Failed to load equipment: $e";
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> submitRequest({
    required String title,
    required String description,
    required String equipmentId,
    required String userId,
    required Priority priority,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final requestData = {
        'title': title,
        'description': description,
        'equipment_id': equipmentId,
        'requested_by_user_id': userId,
        'priority': priority.name,
        'status': 'pending', // Default
        'created_at': DateTime.now().toIso8601String(),
      };

      await _dataService.createRequest(requestData);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = "Failed to submit request: $e";
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
