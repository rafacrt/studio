class User {
  final String id;
  final String email;
  final String name;
  final String avatarUrl;
  final bool isAdmin;
  final String? status; // "Ativo" | "Inativo"
  final String? dateJoined;
  final String? role; // "Usuário" | "Admin" | "Anfitrião"

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.avatarUrl,
    this.isAdmin = false,
    this.status,
    this.dateJoined,
    this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      avatarUrl: json['avatarUrl'],
      isAdmin: json['isAdmin'] ?? false,
      status: json['status'],
      dateJoined: json['dateJoined'],
      role: json['role'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatarUrl': avatarUrl,
      'isAdmin': isAdmin,
      'status': status,
      'dateJoined': dateJoined,
      'role': role,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? avatarUrl,
    bool? isAdmin,
    String? status,
    String? dateJoined,
    String? role,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isAdmin: isAdmin ?? this.isAdmin,
      status: status ?? this.status,
      dateJoined: dateJoined ?? this.dateJoined,
      role: role ?? this.role,
    );
  }
}
