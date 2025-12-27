import 'package:flutter/material.dart';
import '../../core/models/maintenance_request_model.dart';
import '../../core/services/data_service.dart';

class CalendarViewModel extends ChangeNotifier {
  final DataService _dataService = DataService();

  List<MaintenanceRequest> _requests = [];
  List<MaintenanceRequest> get requests => _requests;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadRequests() async {
    _isLoading = true;
    notifyListeners();
    try {
      _requests = await _dataService.getRequests();
    } catch (e) {
      debugPrint('Error loading calendar requests: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Map<DateTime, List<MaintenanceRequest>> get events {
    final Map<DateTime, List<MaintenanceRequest>> data = {};
    for (var r in _requests) {
      if (r.scheduledDate != null) {
        final date = DateTime(
          r.scheduledDate!.year,
          r.scheduledDate!.month,
          r.scheduledDate!.day,
        );
        if (data[date] == null) {
          data[date] = [];
        }
        data[date]!.add(r);
      }
    }
    return data;
  }

  List<MaintenanceRequest> getEventsForDay(DateTime day) {
    final date = DateTime(day.year, day.month, day.day);
    return events[date] ?? [];
  }
}
