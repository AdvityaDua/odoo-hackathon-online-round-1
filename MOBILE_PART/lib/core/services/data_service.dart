import '../api/api_client.dart';
import '../models/equipment_model.dart';
import '../models/maintenance_request_model.dart';
import '../models/work_center_model.dart';
import '../constants/dev_config.dart';
import 'mock_data.dart';
import 'package:dio/dio.dart';

class DataService {
  final ApiClient _apiClient = ApiClient();

  // ----- EQUIPMENT -----
  Future<List<Equipment>> getEquipment({String? assignedUserId}) async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(milliseconds: 500));
      if (assignedUserId != null) {
        return MockData.equipment
            .where((e) => e.assignedUserId == assignedUserId)
            .toList();
      }
      return List.from(MockData.equipment);
    }
    try {
      final response = await _apiClient.dio.get(
        '/equipment/',
        queryParameters: assignedUserId != null
            ? {'assigned_user_id': assignedUserId}
            : null,
      );
      final List data = response.data;
      return data.map((e) => Equipment.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Equipment> getEquipmentById(String id) async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(milliseconds: 300));
      return MockData.equipment.firstWhere((e) => e.id == id);
    }
    try {
      final response = await _apiClient.dio.get('/equipment/$id/');
      return Equipment.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> createEquipment(Map<String, dynamic> equipmentData) async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(seconds: 1));
      MockData.equipment.add(
        Equipment.fromJson({
          ...equipmentData,
          'id': 'new_eq_${DateTime.now().millisecondsSinceEpoch}',
          'status': 'operational',
        }),
      );
      return;
    }
    try {
      await _apiClient.dio.post('/equipment/', data: equipmentData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // ----- REQUESTS -----
  Future<List<MaintenanceRequest>> getRequests({
    String? requesterId,
    String? technicianId,
    String? equipmentId,
    String? status,
  }) async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(milliseconds: 500));
      var list = MockData.requests;
      if (requesterId != null) {
        list = list.where((r) => r.requestedByUserId == requesterId).toList();
      }
      if (technicianId != null) {
        list = list
            .where((r) => r.assignedTechnicianId == technicianId)
            .toList();
      }
      if (equipmentId != null) {
        list = list.where((r) => r.equipmentId == equipmentId).toList();
      }
      if (status != null) {
        list = list
            .where((r) => r.status.name.toLowerCase() == status.toLowerCase())
            .toList();
      }
      return List.from(list);
    }
    try {
      final Map<String, dynamic> query = {};
      if (requesterId != null) query['requested_by'] = requesterId;
      if (technicianId != null) query['assigned_technician'] = technicianId;
      if (equipmentId != null) query['equipment_id'] = equipmentId;
      if (status != null) query['status'] = status;

      final response = await _apiClient.dio.get(
        '/requests/',
        queryParameters: query,
      );
      final List data = response.data;
      return data.map((e) => MaintenanceRequest.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> createRequest(Map<String, dynamic> requestData) async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(seconds: 1));
      MockData.requests.add(
        MaintenanceRequest.fromJson({
          ...requestData,
          'id': 'new_req_${DateTime.now().millisecondsSinceEpoch}',
          'status': 'pending',
          'created_at': DateTime.now().toIso8601String(),
        }),
      );
      return;
    }
    try {
      await _apiClient.dio.post('/requests/', data: requestData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // ----- WORK CENTERS -----
  Future<List<WorkCenter>> getWorkCenters() async {
    if (devAuthEnabled) {
      await Future.delayed(const Duration(milliseconds: 400));
      return List.from(MockData.workCenters);
    }
    try {
      final response = await _apiClient.dio.get('/work-centers/');
      final List data = response.data;
      return data.map((e) => WorkCenter.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(Object e) {
    if (e is DioException) {
      return e.response?.data?['detail'] ?? e.message ?? 'Unknown error';
    }
    return e.toString();
  }
}
