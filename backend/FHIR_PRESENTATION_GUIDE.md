# Hướng dẫn Trình bày & Bảo vệ Đồ án: Module FHIR + Blockchain

Tài liệu này cung cấp nội dung, từ khóa và kịch bản để bạn trình bày phần tích hợp FHIR trong đồ án tốt nghiệp. Đây là "vũ khí bí mật" giúp đồ án của bạn đạt điểm tối đa nhờ tính thực tiễn và công nghệ tiên tiến.

---

## 1. Tại sao lại chọn FHIR? (The "Why")

Khi hội đồng hỏi: *"Tại sao em lại làm thêm cái FHIR này? Hệ thống cũ chạy tốt rồi mà?"*

**Câu trả lời ghi điểm:**
> "Thưa thầy cô, một hệ thống y tế hiện đại không thể đứng một mình (silo). Vấn đề lớn nhất của y tế số hiện nay là **dữ liệu bị phân mảnh**.
>
> Em tích hợp chuẩn **HL7 FHIR (Fast Healthcare Interoperability Resources)** để giải quyết vấn đề này. Nó giúp hệ thống VaxSafe không chỉ quản lý tiêm chủng nội bộ mà còn sẵn sàng **kết nối và chia sẻ dữ liệu** với các hệ thống khác như Bệnh viện, CDC, hoặc Cổng tiêm chủng quốc gia mà không cần sửa đổi cấu trúc dữ liệu cốt lõi.
>
> Đặc biệt, em kết hợp **FHIR với Blockchain** để tạo ra một 'Hộ chiếu vắc-xin' thực sự: **Chuẩn hóa về mặt dữ liệu (FHIR)** và **Minh bạch, không thể sửa đổi về mặt lưu trữ (Blockchain)**."

---

## 2. Kiến trúc hệ thống (The "How")

Bạn nên vẽ hoặc mô tả kiến trúc theo mô hình **"FHIR Facade"**.

*   **Database hiện tại (SQL):** Vẫn là nơi lưu trữ chính, đảm bảo hiệu năng cao cho các nghiệp vụ hàng ngày.
*   **FHIR Facade Layer (Lớp mặt nạ):**
    *   Đây là lớp trung gian em mới xây dựng.
    *   Nó không lưu trữ dữ liệu riêng.
    *   Nhiệm vụ: Khi có yêu cầu, nó "dịch" (map) dữ liệu từ SQL sang định dạng JSON chuẩn quốc tế của FHIR.
*   **Blockchain Extension:**
    *   Trong bản tin FHIR `Immunization` (Tiêm chủng), em đã mở rộng (extend) thêm 2 trường đặc biệt: `transactionHash` và `ipfsHash`.
    *   Điều này cho phép bất kỳ ai nhận được bản tin này đều có thể **xác thực ngược lại với Blockchain** để đảm bảo dữ liệu chưa bị làm giả.

---

## 3. Điểm nhấn kỹ thuật (Key Technical Highlights)

Hãy nhắc đến các từ khóa này trong slide hoặc báo cáo:

1.  **Interoperability (Khả năng tương tác):** Hệ thống nói cùng một ngôn ngữ với thế giới.
2.  **Data Mapping:** Sử dụng `HAPI FHIR` để map chính xác các Entity (`User`, `VaccineRecord`) sang Resource (`Patient`, `Immunization`).
3.  **Custom Extensions:** Tận dụng tính năng mở rộng của FHIR để nhúng thông tin Blockchain (`blockchain-transaction-hash`) vào bản tin y tế chuẩn.

---

## 4. Kịch bản Demo (Live Demo Script)

Để gây ấn tượng mạnh, hãy demo theo luồng sau:

**Bước 1: Quy trình bình thường**
*   Đăng nhập Admin/Bác sĩ.
*   Thực hiện tiêm chủng cho một bệnh nhân -> Lưu thành công.

**Bước 2: Gọi API FHIR (The "Magic")**
*   Mở Postman hoặc trình duyệt.
*   Gọi API: `GET /api/fhir/Immunization?patient={id}`
*   **Chỉ vào màn hình và nói:**
    > "Đây là dữ liệu tiêm chủng của bệnh nhân vừa rồi, nhưng dưới định dạng chuẩn quốc tế FHIR R4."

**Bước 3: Phân tích kết quả JSON**
*   Chỉ vào dòng `"resourceType": "Immunization"`.
*   Chỉ vào phần `extension`:
    > "Thầy cô có thể thấy ở đây, ngoài thông tin y tế như tên vắc-xin, ngày tiêm, em còn đính kèm **Hash giao dịch Blockchain**. Đây là bằng chứng số (digital proof) giúp xác thực mũi tiêm này là thật và vĩnh viễn không thể bị sửa đổi trái phép."

---

## 5. Slide Thuyết trình (Gợi ý bố cục)

### Slide 1: Vấn đề & Giải pháp
*   **Vấn đề:** Dữ liệu y tế rời rạc, khó chia sẻ, khó xác thực độ tin cậy.
*   **Giải pháp:** VaxSafe = Quản lý tiêm chủng + Chuẩn FHIR (Tương tác) + Blockchain (Tin cậy).

### Slide 2: Kiến trúc FHIR Facade
*   (Hình ảnh sơ đồ: Client -> FHIR Controller -> Mapper -> Database)
*   Giải thích: Không đập đi xây lại, mà là lớp phủ thông minh (Smart Layer).

### Slide 3: Cấu trúc bản tin FHIR + Blockchain
*   (Hình ảnh chụp màn hình JSON response)
*   Highlight đỏ vào phần `extension` chứa hash blockchain.
*   Thông điệp: "Dữ liệu chuẩn y tế + Bảo mật Blockchain".

---

## 6. Câu hỏi phản biện thường gặp (Q&A)

**Q: Tại sao không dùng FHIR Server có sẵn (như HAPI JPA Server)?**
**A:** Vì hệ thống cần tùy biến nghiệp vụ tiêm chủng rất sâu và tích hợp Blockchain. Việc dùng mô hình **Facade** giúp em tận dụng được database hiện có, tối ưu hiệu năng mà vẫn đảm bảo chuẩn đầu ra khi cần thiết.

**Q: FHIR phức tạp vậy, làm sao em map hết được?**
**A:** Em tập trung vào các Resource cốt lõi nhất của hệ thống là `Patient` (Bệnh nhân) và `Immunization` (Tiêm chủng). Đây là cách tiếp cận MVP (Minimum Viable Product), giải quyết đúng bài toán cần thiết nhất trước.

**Q: Dữ liệu này có bảo mật không?**
**A:** API FHIR này vẫn nằm sau lớp bảo mật (Spring Security) của hệ thống, chỉ những bác sĩ hoặc hệ thống được ủy quyền (có Token) mới gọi được dữ liệu này.
