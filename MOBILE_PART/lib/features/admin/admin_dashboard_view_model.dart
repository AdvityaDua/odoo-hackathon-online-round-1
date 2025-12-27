import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/equipment_model.dart';

class AdminDashboardViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<Equipment> _equipmentList = [];
  List<Equipment> get equipmentList => _equipmentList;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadDashboard() async {
    _isLoading = true;
    notifyListeners();
    try {
      _equipmentList = await _dataService.getEquipment();
    } catch (e) {
      debugPrint("Error: $e");
    }
    _isLoading = false;
    notifyListeners();
  }
}
