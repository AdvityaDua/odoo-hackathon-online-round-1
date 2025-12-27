class WorkCenter {
  final String id;
  final String name;
  final String locationId;
  final String description;
  final double? latitude;
  final double? longitude;

  WorkCenter({
    required this.id,
    required this.name,
    required this.locationId,
    required this.description,
    this.latitude,
    this.longitude,
  });

  factory WorkCenter.fromJson(Map<String, dynamic> json) {
    return WorkCenter(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      locationId: json['location_id'] ?? '',
      description: json['description'] ?? '',
      latitude: json['latitude'] is num
          ? (json['latitude'] as num).toDouble()
          : null,
      longitude: json['longitude'] is num
          ? (json['longitude'] as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location_id': locationId,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
