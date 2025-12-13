# FHIR Mapping Update Explained

Tài liệu này giải thích các thay đổi gần đây trong hệ thống VaxSafe, tập trung vào việc chuẩn hóa dữ liệu FHIR (Fast Healthcare Interoperability Resources) để tăng tính tương thích quốc tế và độ tin cậy của dữ liệu trên Blockchain.

## 1. Vấn đề Đã Giải Quyết

Trước đây, hệ thống gặp một số hạn chế:
1. **Lỗi `FM-null`**: Các tệp tin danh tính (Identity) của thành viên gia đình (Family Member) được tạo ra trước khi có ID từ cơ sở dữ liệu, dẫn đến tên file và ID bị lỗi (ví dụ: `VaxSafe_Patient_FM-null`).
2. **Extensions "Tự chế"**: Các chỉ số sinh tồn (Chiều cao, Cân nặng...) được lưu dưới dạng `Extension` tùy chỉnh trong resource `Immunization`. Điều này không sai về mặt cú pháp nhưng **không chuẩn** về mặt y tế quốc tế, gây khó khăn cho các hệ thống khác khi đọc dữ liệu.
3. **Dữ liệu Rời rạc**: Thông tin bệnh nhân, tiêm chủng và các phản ứng phụ nằm rải rác hoặc tham chiếu yếu, khó xác minh toàn vẹn một lần.

## 2. Giải Pháp: "All-in-One" FHIR Bundle

Chúng tôi đã chuyển đổi cấu trúc dữ liệu tiêm chủng (Vaccine Record) sang dạng **FHIR Bundle (Collection)**.
Mỗi lần tiêm chủng hoàn tất sẽ tạo ra một gói dữ liệu (Bundle) duy nhất chứa tất cả thông tin liên quan.

### Cấu Trúc Mới của Bundle

Một `Bundle` sẽ bao gồm các `Entry` (thành phần) sau:

#### A. Patient Resource (Snapshot)
Thay vì chỉ lưu tham chiếu (ID), Bundle giờ đây chứa **một bản sao đầy đủ thông tin bệnh nhân** tại thời điểm tiêm.
- **Tác dụng**: Đảm bảo thông tin định danh (Tên, Tuổi, Giới tính, DID) luôn đi kèm với hồ sơ tiêm, không phụ thuộc vào dữ liệu bên ngoài.
- **Cải tiến**:
    - Mapping đầy đủ cho **Family Member**: Bao gồm Phone, National ID, Birth Certificate Number.
    - Sửa lỗi `FM-null`: Đảm bảo ID luôn tồn tại trước khi tạo file.

#### B. Immunization Resource
Resource chính mô tả sự kiện tiêm chủng.
- **Liên kết**: Tham chiếu trực tiếp đến `Patient` trong cùng Bundle.
- **Metadata**: Chứa các Extension về Blockchain (Transaction Hash, IPFS Hash) để xác thực nguồn gốc.

#### C. Observation Resources (Chỉ số sinh tồn - Vitals)
Các chỉ số sinh tồn được tách ra thành các Resource `Observation` riêng biệt và sử dụng mã chuẩn **LOINC** (Logical Observation Identifiers Names and Codes) quốc tế.

| Chỉ số (Vital) | Mã LOINC | Đơn vị |
| :--- | :--- | :--- |
| **Cân nặng** (Body Weight) | `29463-7` | kg |
| **Chiều cao** (Body Height) | `8302-2` | cm |
| **Nhiệt độ** (Body Temperature) | `8310-5` | Cel (°C) |
| **Nhịp tim** (Heart Rate) | `8867-4` | /min |

- **Lợi ích**: Bất kỳ hệ thống y tế nào trên thế giới (Mỹ, Châu Âu...) khi đọc file này đều hiểu ngay đó là cân nặng hay chiều cao mà không cần đọc định nghĩa riêng của VaxSafe.

#### D. AdverseEvent Resource (Phản ứng phụ)
Nếu có phản ứng phụ sau tiêm, một resource `AdverseEvent` sẽ được tạo ra.
- **Liên kết**: Tham chiếu đến `Immunization` như là nguyên nhân gây ra (suspect entity).
- **Chuẩn hóa**: Thay thế extension cũ bằng resource chuẩn của HL7 FHIR.

## 3. Quy Trình Xử Lý Mới

1. **Lưu DB**: Lưu hồ sơ vào database để lấy ID (khắc phục lỗi null).
2. **Tạo Bundle**:
    - Mapper tạo `Bundle`.
    - Mapper gọi `FhirPatientMapper` để tạo snapshot bệnh nhân.
    - Mapper tạo `Immunization`, `Observation` (với LOINC), `AdverseEvent`.
3. **Upload IPFS**: Toàn bộ Bundle (dạng JSON) được upload lên IPFS.
4. **Lưu Blockchain**: Hash của Bundle được lưu vào Smart Contract.

## 4. Tại sao cách này tốt hơn?

- **Interoperability (Tính tương thích)**: Sử dụng mã LOINC và cấu trúc Bundle chuẩn giúp dữ liệu của VaxSafe có thể tích hợp với các hệ thống Bệnh án điện tử (EMR) quốc tế.
- **Verifiability (Tính xác thực)**: Khi download 1 file JSON duy nhất từ IPFS, người dùng có trọn bộ hồ sơ. Việc xác thực chữ ký số trên cả Bundle sẽ đảm bảo tính toàn vẹn của toàn bộ quá trình khám và tiêm.
- **Maintainability (Dễ bảo trì)**: Tách bạch rõ ràng giữa sự kiện tiêm (Immunization) và kết quả đo đạc (Observation).

## 5. Chữ Ký Số và Hộ Chiếu Vắc-xin (Digital Signatures & Provenance)

Để nâng cấp hồ sơ tiêm chủng lên mức độ **"Vaccine Passport Quốc Tế"**, chúng tôi đã bổ sung resource `Provenance` vào trong Bundle. Đây là tiêu chuẩn vàng để chứng minh nguồn gốc và tính pháp lý của dữ liệu y tế.

### Cấu trúc Resource `Provenance`

`Provenance` giữ vai trò là "biên bản xác thực" cho toàn bộ sự kiện tiêm chủng (`Immunization`), chứa 2 chữ ký điện tử quan trọng:

#### 1. Chữ ký Bác sĩ (Author Signature)
- **Vai trò**: Xác nhận chuyên môn, chịu trách nhiệm về mũi tiêm.
- **Agent Type**: `Author` / `Verifier`.
- **Signature Type**: `1.2.840.10065.1.12.1.1` (ISO/ASTM E1762-95 - Authors Signature).
- **Format**: `application/jose` (JSON Web Signature) hoặc chữ ký RSA đã mã hóa.
- **Ý nghĩa**: Chứng minh bác sĩ (người có DID Practitioner) đã thực sự thực hiện và ký xác nhận mũi tiêm này.

#### 2. Chữ ký Bệnh nhân (Consent Signature)
- **Vai trò**: Xác nhận đồng thuận tiêm chủng.
- **Agent Type**: `Witness` (Người làm chứng/Đồng thuận).
- **Signature Type**: `1.2.840.10065.1.12.1.14` (Source Signature / Consent).
- **Ý nghĩa**: Bằng chứng chống chối bỏ (non-repudiation), xác nhận bệnh nhân đã đồng ý tiêm và xác nhận các thông tin cá nhân/y tế là đúng.

### Quy trình Ký số và Lưu trữ

1. **Thu thập**:
    - App Bác sĩ ký private key vào hash của hồ sơ -> tạo `doctorSignature`.
    - App Bệnh nhân hiển thị form đồng thuận (Consent Form), bệnh nhân ký -> tạo `patientConsentSignature`.
2. **Lưu trữ (Backend)**:
    - 2 chữ ký này được lưu vào bảng `vaccine_records` (cột `doctor_signature`, `patient_consent_signature`).
3. **Đóng gói (FHIR Bundle)**:
    - Khi tạo file IPFS, Mapper sẽ chèn resource `Provenance` chứa 2 chữ ký này vào Bundle.
    - Resource này tham chiếu ngược lại `Immunization` qua `target`.

### Kết quả
Khi quét QR Code hoặc tải file từ IPFS, các hệ thống kiểm tra (Verifier) quốc tế có thể:
1. Đọc nội dung tiêm chủng (`Immunization`).
2. Đọc chỉ số sinh tồn (`Observation` LOINC).
3. **Verify chữ ký số** trong `Provenance` để đảm bảo dữ liệu chưa từng bị sửa đổi và thực sự do Bác sĩ/Bệnh nhân đó ký.
