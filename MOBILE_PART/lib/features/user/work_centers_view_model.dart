import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/work_center_model.dart';

class WorkCentersViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<WorkCenter> _workCenters = [];
  List<WorkCenter> get workCenters => _workCenters;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadWorkCenters() async {
    _isLoading = true;
    notifyListeners();
    try {
      _workCenters = await _dataService.getWorkCenters();
    } catch (e) {
      debugPrint("Error loading work centers: $e");
    }
    _isLoading = false;
    notifyListeners();
  }
}
