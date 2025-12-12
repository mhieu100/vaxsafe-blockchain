# 🌐 IPFS-First Architecture & FHIR Integration

Tài liệu này mô tả sự thay đổi về kiến trúc Identity, loại bỏ `FhirController` tập trung và chuyển sang mô hình "Lưu trữ trên IPFS trước" (IPFS-First).

## 1. Sự Thay Đổi (The Change)

### 🔴 Trước đây (Legacy)
*   Identity Data (Tên, Email...) chỉ lưu dưới dạng **text JSON raw** trong Database SQL của VaxSafe.
*   Cột `ipfsDataHash` thực chất chứa nội dung JSON, không phải Link.
*   Các bên thứ 3 muốn lấy dữ liệu FHIR phải gọi qua API tập trung `FhirController`.

### 🟢 Hiện tại (Decentralized)
*   **Upload thật:** Identity Data được convert sang chuẩn **FHIR Patient R4**, upload lên mạng **IPFS Public**.
*   **Lưu Link:** Cột `ipfsDataHash` trong Database và Blockchain chỉ lưu CID (Content ID - ví dụ `QmXyz...`).
*   **Tự chủ dữ liệu:** Bất kỳ ai có CID (từ Blockchain) đều có thể tải hồ sơ về mà không cần thông qua Server VaxSafe.
*   **Xóa bỏ:** Đã xóa `FhirController.java` vì không còn cần thiết.

## 2. Quy Trình Tạo Danh Tính Mới

### 2.1. User (Người Lớn)
1.  Frontend gửi thông tin đăng ký.
2.  Backend (`IdentityService`):
    *   Tạo `IdentityHash` (+SALT bảo mật).
    *   Dùng `FhirPatientMapper` convert User -> FHIR `Patient` Resource.
    *   Gán ID trong FHIR bằng **DID** (`did:vax:vietnam:user:...`).
    *   Upload FHIR JSON lên **IPFS** -> Nhận về `CID`.
    *   Gửi `CID` + `IdentityHash` lên **Blockchain**.

### 2.2. Family Member (Trẻ Em)
1.  User cha/mẹ thêm hồ sơ con.
2.  Backend (`IdentityService`):
    *   Tạo `IdentityHash` riêng cho con.
    *   Tạo FHIR `Patient` Resource cho con.
    *   Thêm Extension `guardian-did` trỏ về DID của cha/mẹ.
    *   Upload lên **IPFS** -> Nhận về `CID`.
    *   Gửi lên **Blockchain** (Ví cha mẹ ký xác nhận).

## 3. Cấu Trúc Dữ Liệu Trên IPFS

Ví dụ một file sau khi tải từ IPFS về:

```json
{
  "resourceType": "Patient",
  "id": "did:vax:vietnam:user:0937a6a4...",
  "identifier": [
    {
      "use": "official",
      "system": "http://vaxsafe.com/did",
      "value": "did:vax:vietnam:user:0937a6a4..."
    }
  ],
  "name": [
    {
      "use": "official",
      "text": "Nguyễn Văn An",
      "family": "Nguyễn",
      "given": ["Văn", "An"]
    }
  ],
  "birthDate": "1990-01-01",
  "gender": "male",
  "extension": [
     // Nếu là FamilyMember thì có thêm dòng này:
     {
       "url": "http://vaxsafe.com/fhir/StructureDefinition/guardian-did",
       "valueString": "did:vax:vietnam:user:GUARDIAN_HASH..."
     }
  ]
}
```

## 4. Lợi Ích
1.  **Interoperability:** Các bệnh viện khác chỉ cần tuân thủ chuẩn FHIR là đọc được ngay.
2.  **Availability:** Server VaxSafe sập, dữ liệu danh tính trên IPFS vẫn sống.
3.  **Trust:** Dữ liệu có chữ ký số và hash bảo đảm trên Blockchain.
