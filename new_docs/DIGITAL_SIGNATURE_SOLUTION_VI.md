# Giải Pháp Triển Khai Chữ Ký Số (Digital Signatures)

Hiện tại, hệ thống Backend đã sẵn sàng tiếp nhận chữ ký số, nhưng Frontend chưa có giao diện để thu thập chúng. Dưới đây là giải pháp đề xuất để hoàn thiện tính năng này, đảm bảo tiêu chuẩn "Hộ chiếu Vắc-xin".

## 1. Vấn đề Hiện Tại
- **Backend**: Đã có trường `doctorSignature` và `patientConsentSignature` trong API và database.
- **Frontend**: Modal hoàn thành (`CompletionModal`) chỉ nhập chỉ số sinh tồn, chưa có bước ký tên. Dữ liệu gửi lên đang thiếu chữ ký (null).

## 2. Giải Pháp Đề Xuất cho Frontend

Chúng ta cần cập nhật `CompletionModal.jsx` để thêm **Bước 4: Ký xác nhận & Đồng thuận**.

### A. Giả lập Chữ ký (Mocking/Simulation) - Giai đoạn 1 (Nhanh)
Để kiểm thử luồng FHIR Bundle mà chưa cần tích hợp phần cứng ký số phức tạp (như USB Token hay ví Metamask):

1. **Chữ ký Bác sĩ**:
    - Thêm một nút "Ký điện tử" (Sign).
    - Khi bấm, hệ thống sẽ tạo một chuỗi giả lập (ví dụ: `Base64(SHA256("DoctorSigned" + timestamp))`) hoặc dùng một cặp khóa RSA giả định lưu trong LocalStorage để ký.
    - Hiển thị: "✅ Đã ký bởi Bác sĩ [Tên]".

2. **Đồng thuận của Bệnh nhân**:
    - Thêm checkbox: "Tôi xác nhận đồng ý tiêm và các thông tin sức khỏe là chính xác."
    - Khi tích chọn, hệ thống tạo chuỗi giả lập (ví dụ: `Base64(SHA256("PatientConsented" + timestamp))`).

### B. Tích hợp Chữ ký Thực (Real Implementation) - Giai đoạn 2 (Production)
1. **Bác sĩ**:
    - Tích hợp với **Ví Metamask** của bác sĩ hoặc hệ thống **Private Key** quản lý tập trung (HSM).
    - Khi bấm "Ký", gọi Metamask pop-up yêu cầu ký message.

2. **Bệnh nhân**:
    - Cho phép ký tay trên màn hình cảm ứng (Canvas Signature) -> chuyển thành ảnh -> Hash ảnh đó làm chữ ký.
    - Hoặc gửi OTP xác nhận qua điện thoại -> OTP đúng coi như đã ký.

## 3. Các Bước Cần Làm Ngay (Giai đoạn 1)

Tôi đề xuất sửa `CompletionModal.jsx` như sau:

1. Thêm state mới lưu trữ chữ ký: `const [signatures, setSignatures] = useState({ doctor: null, patient: null });`
2. Thêm một bước (Step) mới trong Modal: "Ký xác nhận".
3. Trong bước này:
   - Nút "Bác sĩ ký xác nhận" -> Sinh chuỗi ký giả định.
   - Checkbox "Bệnh nhân đồng ý tiêm chủng" -> Sinh chuỗi ký giả định.
4. Khi gọi API `handleFinish`, gửi kèm 2 chuỗi này lên Backend.

Bạn có muốn tôi tiến hành cập nhật Frontend theo hướng **Giai đoạn 1** (Giả lập để test luồng FHIR) ngay không?
