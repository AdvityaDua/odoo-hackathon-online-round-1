enum UserRole { user, technician, admin }

class UserModel {
  final String id;
  final String email;
  final String? name;
  final UserRole role;
  final String? department;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    required this.role,
    this.department,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      role: _parseRole(json['role']),
      department: json['department'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role.name,
      'department': department,
    };
  }

  static UserRole _parseRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'technician':
        return UserRole.technician;
      case 'user':
      default:
        return UserRole.user;
    }
  }
}
