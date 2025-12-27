import 'equipment_model.dart';

enum RequestStatus { pending, assigned, inProgress, completed, cancelled }

class MaintenanceRequest {
  final String id;
  final String title;
  final String description;
  final String equipmentId;
  final String requestedByUserId;
  final String? assignedTechnicianId;
  final Priority priority;
  final RequestStatus status;
  final DateTime createdAt;
  final DateTime? scheduledDate;
  final String? workCenterId;

  // Optional: Expanded objects for UI convenience if API returns nested
  final String? equipmentName;
  final String? requestedByName;

  MaintenanceRequest({
    required this.id,
    required this.title,
    required this.description,
    required this.equipmentId,
    required this.requestedByUserId,
    this.assignedTechnicianId,
    required this.priority,
    required this.status,
    required this.createdAt,
    this.scheduledDate,
    this.workCenterId,
    this.equipmentName,
    this.requestedByName,
  });

  factory MaintenanceRequest.fromJson(Map<String, dynamic> json) {
    return MaintenanceRequest(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Maintenance Request',
      description: json['description'] ?? '',
      equipmentId: json['equipment_id'] ?? '',
      requestedByUserId: json['requested_by_user_id'] ?? '',
      assignedTechnicianId: json['assigned_technician_id'],
      priority: _parsePriority(json['priority']),
      status: _parseStatus(json['status']),
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      scheduledDate: json['scheduled_date'] != null
          ? DateTime.tryParse(json['scheduled_date'])
          : null,
      workCenterId: json['work_center_id'],
      equipmentName: json['equipment_name'],
      requestedByName: json['requested_by_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'equipment_id': equipmentId,
      'requested_by_user_id': requestedByUserId,
      'assigned_technician_id': assignedTechnicianId,
      'priority': priority.name,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'scheduled_date': scheduledDate?.toIso8601String(),
      'work_center_id': workCenterId,
    };
  }

  static Priority _parsePriority(String? p) {
    switch (p?.toLowerCase()) {
      case 'critical':
        return Priority.critical;
      case 'high':
        return Priority.high;
      case 'medium':
        return Priority.medium;
      case 'low':
      default:
        return Priority.low;
    }
  }

  static RequestStatus _parseStatus(String? s) {
    switch (s?.toLowerCase()) {
      case 'assigned':
        return RequestStatus.assigned;
      case 'in_progress':
      case 'inprogress':
        return RequestStatus.inProgress;
      case 'completed':
        return RequestStatus.completed;
      case 'cancelled':
        return RequestStatus.cancelled;
      case 'pending':
      default:
        return RequestStatus.pending;
    }
  }
}
