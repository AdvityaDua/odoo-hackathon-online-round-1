enum UserRole {
  employee,
  technician,
  manager,
}

class AppUser {
  final String uid;
  final String email;
  final String name;
  final UserRole role;
  final String? teamId;
  final bool isActive;

  AppUser({
    required this.uid,
    required this.email,
    required this.name,
    required this.role,
    this.teamId,
    required this.isActive,
  });

  factory AppUser.fromMap(Map<String, dynamic> data, String uid) {
    return AppUser(
      uid: uid,
      email: data['email'] ?? '',
      name: data['name'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.name == data['role'],
        orElse: () => UserRole.employee,
      ),
      teamId: data['teamId'],
      isActive: data['isActive'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'role': role.name,
      'teamId': teamId,
      'isActive': isActive,
    };
  }
}
