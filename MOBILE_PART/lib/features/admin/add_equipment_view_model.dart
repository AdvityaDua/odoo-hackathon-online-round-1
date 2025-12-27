import 'package:flutter/material.dart';
import '../../core/services/data_service.dart';
import '../../core/models/equipment_model.dart';

class AddEquipmentViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  Future<bool> addEquipment({
    required String name,
    required String serialNumber,
    required String categoryId,
    required String description,
    required EquipmentStatus status,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Mock API call or extend DataService to post equipment
      // Currently DataService only has 'createRequest'.
      // We need to add 'createEquipment' to DataService or mock it.
      // Assuming we update DataService.

      final eqData = {
        'name': name,
        'serial_number': serialNumber,
        'category_id': categoryId,
        'status': status.name,
        'description': description,
        // 'image_url': ...
      };

      await _dataService.createEquipment(eqData);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
