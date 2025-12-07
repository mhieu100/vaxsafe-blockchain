class UserModel {
  final int id;
  final String email;
  final String fullName;
  final String? avatar;
  final String role;
  final String? phone;
  final String? address;
  final String? birthday;
  final String? gender;
  final String? identityNumber;
  final String? bloodType;
  final double? heightCm;
  final double? weightKg;
  final bool isActive;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.avatar,
    required this.role,
    this.phone,
    this.address,
    this.birthday,
    this.gender,
    this.identityNumber,
    this.bloodType,
    this.heightCm,
    this.weightKg,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      avatar: json['avatar'],
      role: json['role'] ?? 'PATIENT',
      phone: json['phone'],
      address: json['address'],
      birthday: json['birthday'],
      gender: json['gender'],
      identityNumber: json['identityNumber'],
      bloodType: json['bloodType'],
      heightCm: json['heightCm']?.toDouble(),
      weightKg: json['weightKg']?.toDouble(),
      isActive: json['isActive'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'avatar': avatar,
      'role': role,
      'phone': phone,
      'address': address,
      'birthday': birthday,
      'gender': gender,
      'identityNumber': identityNumber,
      'bloodType': bloodType,
      'heightCm': heightCm,
      'weightKg': weightKg,
      'isActive': isActive,
    };
  }
}
