import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/equipment_model.dart';

import '../../core/models/maintenance_request_model.dart';

class EquipmentDetailsViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  Equipment? _equipment;
  Equipment? get equipment => _equipment;

  List<MaintenanceRequest> _history = [];
  List<MaintenanceRequest> get history => _history;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadEquipment(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      _equipment = await _dataService.getEquipmentById(id);
      _history = await _dataService.getRequests(equipmentId: id);
    } catch (e) {
      debugPrint("Error loading equipment details: $e");
    }
    _isLoading = false;
    notifyListeners();
  }
}
