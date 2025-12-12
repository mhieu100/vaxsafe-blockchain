Tính đến thời điểm hiện tại, FHIR (Fast Healthcare Interoperability Resources) đang được áp dụng trong hệ thống VaxSafe như một tiêu chuẩn để chuẩn hóa dữ liệu y tế trước khi lưu trữ phi tập trung (IPFS/Blockchain).

Dưới đây là chi tiết cụ thể về cách hệ thống đang sử dụng FHIR:

1. Vai trò của FHIR trong hệ thống
FHIR đóng vai trò là "Ngôn ngữ chung" (Standard Format) để định dạng dữ liệu. Thay vì lưu một file JSON tự chế lên IPFS, hệ thống chuyển đổi dữ liệu thành các Resource chuẩn quốc tế (FHIR R4). Điều này giúp dữ liệu trên Blockchain có thể được đọc hiểu bởi các hệ thống y tế khác trong tương lai.

2. Các Resource đang sử dụng
Hệ thống sử dụng thư viện HAPI FHIR (ca.uhn.fhir.context.FhirContext) để ánh xạ các entity của hệ thống sang FHIR Resource:

VaccineRecord
 -> 
Immunization
 Resource:
Đây là phần quan trọng nhất. Mỗi khi hồ sơ tiêm chủng được tạo, nó được convert sang một object 
Immunization
 của FHIR.
Workflow:
Tạo record trong Database.
Gọi 
FhirImmunizationMapper
 để convert sang FHIR JSON.
Upload đoạn JSON này lên IPFS.
Lấy Hash của IPFS lưu vào Database và Smart Contract.
User/Patient -> 
Patient
 Resource:
Thông tin hồ sơ người dùng (Tên, ngày sinh, giới tính, địa chỉ, CMT/CCCD) được chuẩn hóa thành resource 
Patient
.
3. Cách xử lý dữ liệu mở rộng (Extensions)
Do FHIR 
Immunization
 chuẩn không có các trường để lưu các chỉ số sinh tồn (Vitals) hay thông tin Blockchain, hệ thống đang sử dụng cơ chế Extension của FHIR để nhúng các dữ liệu này vào:

Vitals (Chỉ số sinh tồn): Được lưu dưới dạng extension custom.
http://vaxsafe.com/fhir/StructureDefinition/vital-weight: Cân nặng.
http://vaxsafe.com/fhir/StructureDefinition/vital-height: Chiều cao.
http://vaxsafe.com/fhir/StructureDefinition/vital-temperature: Nhiệt độ.
http://vaxsafe.com/fhir/StructureDefinition/vital-pulse: Nhịp tim.
Blockchain Data:
http://vaxsafe.com/fhir/StructureDefinition/blockchain-transaction-hash: Lưu Transaction Hash.
http://vaxsafe.com/fhir/StructureDefinition/ipfs-hash: Lưu IPFS Hash.
4. Code Implemetation
Logic này nằm chủ yếu ở:

Service: 
VaccineRecordService.java
 (đoạn xử lý 
createFromAppointment
).
Mapper: 
dto/mapper/fhir/FhirImmunizationMapper.java
 và 
FhirPatientMapper.java
.
Tóm lại: FHIR hiện tại không dùng để giao tiếp giữa Client-Server (Frontend-Backend) qua API, mà dùng để đóng gói dữ liệu (Data Packaging) chuẩn y tế trước khi đưa lên Blockchain/IPFS.


Trong thực tế (ngành y tế thế giới và tại Việt Nam), FHIR (Fast Healthcare Interoperability Resources) được dùng rộng rãi hơn rất nhiều so với cách chúng ta đang dùng trong dự án. Nó là tiêu chuẩn vàng cho việc trao đổi dữ liệu y tế.

Dưới đây là các ứng dụng thực tế phổ biến của FHIR:

1. Đồng bộ dữ liệu giữa các bệnh viện (Interoperability)
Vấn đề: Bệnh viện A dùng phần mềm HIS (Hospital Information System) của Viettel, Bệnh viện B dùng của VNPT. Hai hệ thống này có cấu trúc database khác nhau, không "nói chuyện" được với nhau.
Giải pháp FHIR: Khi chuyển tuyến bệnh nhân từ A sang B, HIS của A sẽ xuất hồ sơ bệnh án ra định dạng chuẩn FHIR. HIS của B đọc file đó và hiểu ngay lập tức (đâu là tên thuốc, đâu là chẩn đoán) mà không cần lập trình riêng.
2. Tích hợp thiết bị Wearable & Apple Health
Ứng dụng: Apple Health, Google Fit, hay các thiết bị như đồng hồ Garmin đều hỗ trợ xuất/nhập dữ liệu sức khỏe (nhịp tim, bước chân, giấc ngủ) qua chuẩn FHIR.
Thực tế: Một ứng dụng bác sĩ có thể yêu cầu quyền truy cập Apple HealthKit để lấy dữ liệu nhịp tim của bệnh nhân dưới dạng Observation resource của FHIR để chẩn đoán từ xa.
3. Hệ thống Hồ sơ sức khỏe điện tử quốc gia (EHR/PHR)
Nhiều quốc gia xây dựng trục tích hợp dữ liệu quốc gia bằng FHIR. Mọi phòng khám, bệnh viện khi khám xong phải gửi một bản tin FHIR (Bundle) chứa thông tin khám chữa bệnh về trục này để lưu vào hồ sơ sức khỏe toàn dân.
4. Hỗ trợ Clinical Decision Support (CDS) - Quyết định lâm sàng
Các hệ thống AI hoặc gợi ý đơn thuốc thường chạy độc lập. Khi bác sĩ kê đơn trên HIS, HIS sẽ gửi thông tin bệnh nhân (tuổi, dị ứng, chẩn đoán) dưới dạng FHIR sang hệ thống CDS.
CDS phân tích và trả về cảnh báo (ví dụ: "Thuốc này kỵ với tiền sử dị ứng của bệnh nhân") cũng dưới dạng FHIR.
5. SMART on FHIR (Ứng dụng bên thứ 3)
Cho phép các developer viết các "App" (như đặt lịch, xem kết quả xét nghiệm, biểu đồ tăng trưởng cho bé) chạy được trên bất kỳ hệ thống bệnh viện nào có hỗ trợ chuẩn này, giống như cài App trên iPhone vậy.
Tóm lại:
Trong project của chúng ta, FHIR đang dùng ở mức "Lưu trữ chuẩn" (Data Serialization). Còn trong thực tế, sức mạnh lớn nhất của nó là "Giao tiếp & Kết nối" (Exchange & API) giữa các hệ thống không đồng nhất.