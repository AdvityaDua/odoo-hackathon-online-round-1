enum EquipmentStatus { operational, maintenanceRequired, down }

enum Priority { low, medium, high, critical }

class Equipment {
  final String id;
  final String name;
  final String serialNumber;
  final String categoryId;
  final String? locationId;
  final String? assignedUserId;
  final EquipmentStatus status;
  final String description;
  final String imageUrl;

  Equipment({
    required this.id,
    required this.name,
    required this.serialNumber,
    required this.categoryId,
    this.locationId,
    this.assignedUserId,
    required this.status,
    required this.description,
    required this.imageUrl,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Equipment',
      serialNumber: json['serial_number'] ?? '',
      categoryId: json['category_id'] ?? '',
      locationId: json['location_id'],
      assignedUserId: json['assigned_user_id'],
      status: _parseStatus(json['status']),
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'serial_number': serialNumber,
      'category_id': categoryId,
      'location_id': locationId,
      'assigned_user_id': assignedUserId,
      'status': status.name,
      'description': description,
      'image_url': imageUrl,
    };
  }

  static EquipmentStatus _parseStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'maintenance_required':
      case 'maintenance':
        return EquipmentStatus.maintenanceRequired;
      case 'down':
        return EquipmentStatus.down;
      case 'operational':
      default:
        return EquipmentStatus.operational;
    }
  }
}
