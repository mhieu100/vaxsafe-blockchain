# 🔒 Tăng Cường Bảo Mật Danh Tính Blockchain

Tài liệu này mô tả kỹ thuật **Salting** được áp dụng để bảo vệ `IdentityHash` của người dùng trên Blockchain, chống lại các cuộc tấn công từ điển (Dictionary Attacks) và dò ngược dữ liệu.

## 1. Vấn đề Bảo mật (The Problem)

### Cách cũ (Không an toàn):
Hệ thống tạo Identity Hash bằng cách băm trực tiếp thông tin cá nhân:
`Hash = SHA256(CCCD + Tên + Ngày Sinh)`

**Rủi ro:**
*   Dữ liệu như Ngày sinh, Tên, CCCD có nguồn gốc hữu hạn và dễ đoán.
*   Hacker nếu có danh sách CCCD (từ nguồn lộ lọt khác) có thể chạy tool tự động hash thử hàng triệu combo để so sánh. Nếu hash khớp -> Tìm ra danh tính thật của người đứng sau địa chỉ ví.

## 2. Giải Pháp: Adding SECRET SALT

### Cách mới (Đã cải tiến):
Chúng ta thêm một chuỗi "SALT" (Muối) bí mật vào dữ liệu trước khi băm. Chuỗi này chỉ Backend biết và được lưu trong biến môi trường (Environment Variable), tuyệt đối không public.

`Hash = SHA256(CCCD + Tên + Ngày Sinh + "VAXSAFE_IDENTITY" + SECRET_SALT)`

**Lợi ích:**
*   **Chống Dictionary Attack:** Kể cả hacker có CCCD của bạn, họ không biết `SECRET_SALT`, nên họ không thể tạo ra hash giống hệ thống được.
*   **Chống Rainbow Table:** Các bảng băm cầu vồng (Rainbow Tables) có sẵn trên mạng trở nên vô dụng.

## 3. Cấu Hình Kỹ Thuật

### 3.1. Code thay đổi
File `IdentityService.java` đã được cập nhật để inject giá trị từ file cấu hình:

```java
@Value("${identity.hashing.salt:VAXSAFE_SECRET_SALT_2024}")
private String identitySalt;

// ...
String data = String.format("%s:%s:%s:VAXSAFE_IDENTITY:%s",
        identityNum, fullName, dob, identitySalt);
```

### 3.2. Triển khai (DevOps)
Trên server production, cần đặt biến môi trường để override giá trị mặc định:

```bash
# Trong file .env hoặc Docker Compose
IDENTITY_HASHING_SALT=Chuoi_Ky_Tu_Ngau_Nhien_Cuc_Manh_Dai_64_Ky_Tu_!@#
```

## 4. Lưu ý khi vận hành (Critical Notes)

1.  **Không được làm mất SALT:** Nếu mất hoặc thay đổi chuỗi SALT này, toàn bộ `identityHash` cũ sẽ không thể tái tạo lại được -> Mất kết nối với dữ liệu trên Blockchain cũ.
2.  **Backup:** Phải backup chuỗi SALT này kỹ lưỡng như backup Database Password.
3.  **Rotation (Xoay vòng):** Nếu nghi ngờ lộ SALT, phải có quy trình migrate Identity hash (Khá phức tạp, nên cố gắng đừng để lộ).
