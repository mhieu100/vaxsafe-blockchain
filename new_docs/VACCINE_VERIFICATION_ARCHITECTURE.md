# Kiến Trúc Xác Minh Tiêm Chủng Phi Tập Trung (Decentralized Vaccine Verification)

## 1. Giới thiệu

VaxSafe sử dụng công nghệ Blockchain kết hợp với các tiêu chuẩn y tế quốc tế (HL7 FHIR, Smart Health Cards) để tạo ra một hệ thống **Hộ chiếu vắc-xin số (Digital Vaccine Passport)** có khả năng xác minh tức thì, bảo mật và hoạt động offline.

Tài liệu này giải thích cơ chế hoạt động, vai trò của Blockchain và cách hệ thống đảm bảo tính toàn vẹn dữ liệu.

---

## 2. Các thành phần cốt lõi

### 2.1. "Chiếc vé" - Smart Health Card (QR Code)
Đây là dữ liệu mà người dùng nắm giữ (trên ứng dụng Mobile hoặc in ra giấy).
*   **Định dạng**: QR Code.
*   **Nội dung**: Một file JSON theo chuẩn **FHIR Bundle** (như đã triển khai) chứa:
    *   Thông tin định danh bệnh nhân (tối thiểu: Tên, Ngày sinh).
    *   Thông tin mũi tiêm (Vaccine, Ngày tiêm, Lô sản xuất).
    *   **Chữ ký số (Digital Signature)**: Được ký bởi Private Key của đơn vị tiêm chủng (Issuer).
*   **Đặc điểm**: Dữ liệu được nén và ký, không thể bị làm giả.

### 2.2. "Cảnh sát" - Blockchain (Trust Layer)
Blockchain đóng vai trò là "mỏ neo niềm tin" (Trust Anchor) của hệ thống.
*   **Lưu trữ Public Key (DID Document)**: Blockchain lưu trữ các định danh phi tập trung (DID) của các trung tâm tiêm chủng uy tín (ví dụ: VNVC, Bệnh viện A).
    *   Mỗi DID trỏ tới một Public Key.
    *   App xác minh sẽ dùng Public Key này để kiểm tra chữ ký trong QR Code.
*   **Trạng thái thu hồi (Revocation Registry)**: Lưu trữ danh sách các chứng nhận bị hủy bỏ (do lỗi, cấp sai).
*   **Bằng chứng toàn vẹn (Integrity Proof)**: Lưu `transactionHash` và `ipfsHash` của hồ sơ gốc để đối chiếu khi cần thiết (Audit/Pháp lý).

### 2.3. "Người soát vé" - Ứng dụng Xác minh (Verifier App)
Là ứng dụng của bên thứ 3 (Hải quan, Sân bay, Trường học) dùng để quét QR.
*   Hoạt động **Offline**: Chỉ cần verify chữ ký JWS là biết QR thật/giả.
*   Hoạt động **Online (Nâng cao)**: Query lên Blockchain để check xem chứng chỉ có bị Thu hồi (Revoked) hay không, hoặc check xem Issuer có còn uy tín không.

---

## 3. Quy trình Xác minh (Verification Flow)

### Bước 1: Quét mã
Người xác minh dùng Camera quét mã QR trên ứng dụng VaxSafe của bệnh nhân.

### Bước 2: Giải mã & Trích xuất
Ứng dụng đọc chuỗi JWS từ QR, giải nén để lấy ra file **FHIR Bundle JSON**.
-> Hiển thị thông tin cơ bản: *"Nguyễn Văn A - 2 mũi Pfizer - Ngày 14/12/2025"*.

### Bước 3: Xác thực Chữ ký (Cryptography Check)
1. Ứng dụng đọc trường `iss` (Issuer) trong JWS (ví dụ: `did:vax:org:vnvc`).
2. Ứng dụng lấy **Public Key** của Issuer này (từ bộ nhớ đệm hoặc tra cứu trên Blockchain).
3. Sử dụng Public Key để verify chữ ký số trong JWS.
    *   Nếu khớp: ✅ **Dữ liệu nguyên vẹn, do đúng VNVC cấp.**
    *   Nếu không khớp: ❌ **QR giả mạo hoặc đã bị sửa đổi.**

### Bước 4: Kiểm tra Trạng thái trên Blockchain (Blockchain Check - Optional)
Để an toàn tuyệt đối, ứng dụng gửi ID của chứng nhận lên Blockchain (Smart Contract).
*   Contract trả về: `Valid` hoặc `Revoked`.
*   Nếu `Revoked`: ❌ **Chứng nhận này đã bị hủy.**

---

## 4. Tại sao cần Blockchain? (Tại sao không dùng Server truyền thống?)

| Tiêu chí | Server Truyền thống (SQL) | VaxSafe (Blockchain + DID) |
| :--- | :--- | :--- |
| **Sự phụ thuộc** | Phải tin tưởng tuyệt đối vào Server của bệnh viện. Nếu Server sập -> Không xác minh được. | **Không phụ thuộc**. Dữ liệu nằm trong QR của người dùng. Blockchain đảm bảo tính xác thực 24/7. |
| **Bảo mật** | Hacker hack server -> Sửa dữ liệu, cấp chứng chỉ khống hàng loạt. | Rất khó hack Blockchain. Dữ liệu y tế không lưu trực tiếp trên chain (chỉ lưu Hash/Key) -> **Bảo mật quyền riêng tư**. |
| **Xác minh quốc tế** | Các nước phải kết nối API với nhau (phức tạp, rào cản chính trị). | **Chuẩn mở**. Bất kỳ ai có Public Key (trên Blockchain công khai) đều verify được mà không cần xin phép/kết nối API. |
| **Quyền sở hữu** | Bệnh viện giữ dữ liệu. | **Người dùng giữ dữ liệu** (Self-Sovereign Identity). |

---

## 5. Kết luận
VaxSafe không chỉ số hóa sổ tiêm chủng, mà còn trao quyền sở hữu dữ liệu cho người dùng và cung cấp cơ chế xác minh **phi tập trung, minh bạch và không thể chối bỏ** nhờ công nghệ Blockchain.
