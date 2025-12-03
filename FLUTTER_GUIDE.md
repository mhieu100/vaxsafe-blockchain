# Hướng dẫn Phát triển VaxSafe Mobile App với Flutter

## 1. Tổng quan
Ứng dụng di động VaxSafe sẽ cho phép người dùng (Bệnh nhân) quản lý hồ sơ tiêm chủng, đặt lịch và xem Digital Medicine Card ngay trên điện thoại.

## 2. Công nghệ sử dụng
- **Framework**: Flutter (Dart)
- **State Management**: Provider hoặc Riverpod
- **Networking**: Dio (khuyên dùng hơn http vì interceptor mạnh mẽ)
- **Local Storage**: flutter_secure_storage (lưu Token), shared_preferences (lưu setting đơn giản)
- **Authentication**: Google Sign-In

## 3. Cấu trúc dự án đề xuất
```
lib/
├── config/              # Cấu hình (Theme, Constants, Routes)
├── core/                # Các module dùng chung (API Client, Utils)
├── data/                # Data Layer
│   ├── models/          # Data Models (User, Appointment...)
│   ├── repositories/    # Xử lý logic gọi API
│   └── services/        # Các service (AuthService, LocalStorage...)
├── presentation/        # UI Layer
│   ├── common/          # Widgets dùng chung (Button, Input...)
│   ├── screens/         # Các màn hình (Login, Home, Profile...)
│   └── providers/       # State Management
└── main.dart            # Entry point
```

## 4. Quy trình tích hợp API (Backend Integration)

### A. Authentication Flow
1. **Login Screen**:
   - Form nhập Email/Pass -> Gọi API `POST /auth/login/password`.
   - Nút "Login with Google" -> Dùng lib `google_sign_in` lấy ID Token -> Gọi API Backend (cần implement thêm endpoint verify token nếu chưa có).

2. **Token Management**:
   - Lưu `accessToken` và `refreshToken` vào `flutter_secure_storage`.
   - Sử dụng `Dio Interceptor` để tự động đính kèm Token vào header `Authorization: Bearer {token}`.
   - Xử lý tự động refresh token khi gặp lỗi 401.

### B. Complete Profile & Digital Identity
Đây là luồng quan trọng nhất để tạo thẻ y tế số.

1. **Kiểm tra trạng thái**:
   - Sau khi Login thành công, kiểm tra `user.patientProfile`.
   - Nếu `null` -> Navigate sang màn hình `CompleteProfileScreen`.

2. **Màn hình Complete Profile**:
   - Form nhập: Ngày sinh, Giới tính, CCCD, Địa chỉ...
   - **Lưu ý**: Validate kỹ ngày sinh và CCCD ở client side.
   - Submit -> Gọi API `POST /auth/complete-profile`.
   - Thành công -> Chuyển vào màn hình Home.

### C. Digital Medicine Card
- Hiển thị QR Code (được tạo từ DID hoặc Identity Hash).
- Hiển thị danh sách mũi tiêm (Vaccine Records) lấy từ API `GET /vaccine-records`.

## 5. Các thư viện cần thiết (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1
  google_sign_in: ^6.1.6
  intl: ^0.19.0  # Xử lý ngày tháng
  qr_flutter: ^4.1.0 # Hiển thị QR Code
```

## 6. Bước tiếp theo
1. Cài đặt Flutter SDK (nếu chưa có).
2. Chạy lệnh tạo project: `flutter create vaxsafe_mobile`.
3. Setup cấu trúc thư mục theo mục 3.
4. Implement lớp `ApiClient` với Dio.
