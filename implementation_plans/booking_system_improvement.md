# Kế hoạch Cải thiện Hệ thống Đặt lịch Tiêm chủng

Tài liệu này phác thảo các bước cần thiết để giải quyết các vấn đề hiện tại của hệ thống đặt lịch (Booking System), tập trung vào việc ngăn chặn quá tải (overbooking), cải thiện trải nghiệm người dùng và quản lý lịch làm việc của bác sĩ.

## 1. Mục tiêu
*   **Ngăn chặn Overbooking**: Đảm bảo số lượng lịch đặt không vượt quá năng lực phục vụ của trung tâm trong mỗi khung giờ.
*   **Dynamic Time Slots**: Hiển thị các khung giờ thực tế dựa trên tình trạng còn trống, thay vì danh sách cố định.
*   **Tối ưu quy trình gán Bác sĩ**: Đảm bảo mỗi lịch hẹn đều được xử lý bởi một bác sĩ cụ thể.

## 2. Phân tích Hiện trạng
*   **Center Model**: Đã có trường `capacity` (int), nhưng chưa rõ đây là capacity tổng hay theo giờ. Giả định đây là capacity tối đa cho mỗi khung giờ (TimeSlot).
*   **Booking Flow**: `createBooking` hiện tại tạo `Appointment` mà không kiểm tra số lượng `Appointment` đã tồn tại trong khung giờ đó.
*   **Frontend**: `AppointmentSection.jsx` sử dụng danh sách `timeSlots` cố định (hardcoded).

## 3. Kế hoạch Thực hiện (Action Plan)

### Giai đoạn 1: Backend - Quản lý Slot & Validate (Ưu tiên cao nhất)

Mục tiêu: Backend phải là chốt chặn cuối cùng để đảm bảo tính toàn vẹn dữ liệu.

*   **Task 1.1: API Kiểm tra Slot Trống (Availability Check)**
    *   **Endpoint**: `GET /api/bookings/availability`
    *   **Params**: `centerId`, `date` (YYYY-MM-DD)
    *   **Logic**:
        1.  Lấy `capacity` của Center.
        2.  Query DB đếm số lượng `Appointment` có `status != CANCELLED` cho từng `TimeSlotEnum` trong ngày đó tại center đó.
        3.  Tính `remaining = capacity - bookedCount`.
        4.  Trả về danh sách các slot kèm trạng thái (Available/Full).

*   **Task 1.2: Validate trong `createBooking`**
    *   Trước khi lưu `Booking` và `Appointment`, gọi logic kiểm tra tương tự Task 1.1.
    *   Nếu `bookedCount >= capacity` cho slot được chọn -> Throw `AppException("Time slot is full")`.
    *   *Lưu ý*: Cần xử lý `synchronized` hoặc database lock để tránh Race Condition khi nhiều người đặt cùng lúc (có thể bỏ qua ở mức độ MVP nhưng cần lưu ý).

### Giai đoạn 2: Frontend - Hiển thị Slot Động

Mục tiêu: Người dùng chỉ nhìn thấy và chọn được những gì thực sự khả dụng.

*   **Task 2.1: Tích hợp API Availability**
    *   Trong `AppointmentSection.jsx`:
        *   Khi user chọn `Center` và `Date` -> Gọi API `GET /api/bookings/availability`.
        *   Cập nhật state `availableSlots`.
*   **Task 2.2: Cập nhật UI chọn giờ**
    *   Thay thế danh sách `timeSlots` cố định bằng dữ liệu từ API.
    *   Disable các slot có `remaining <= 0`.
    *   Hiển thị cảnh báo nếu slot sắp hết (ví dụ: "Chỉ còn 2 chỗ").

### Giai đoạn 3: Quy trình Gán Bác sĩ (Operational)

Mục tiêu: Đảm bảo vận hành trôi chảy tại phòng khám.

*   **Task 3.1: Auto-assign (Optional)**
    *   Khi booking được confirm (đã thanh toán), hệ thống tìm một bác sĩ có `DoctorAvailableSlot` trống trong khung giờ đó và gán tự động.
*   **Task 3.2: Dashboard cho Quản lý (Admin/Staff)**
    *   Tạo view "Lịch chưa gán bác sĩ" để quản lý trung tâm có thể kéo thả hoặc gán thủ công bác sĩ cho các lịch đặt online vào đầu ngày.

## 4. Chi tiết Kỹ thuật (Technical Specs)

### 4.1. API Response cho `/availability`
```json
{
  "date": "2024-12-06",
  "centerId": 1,
  "slots": [
    {
      "timeSlot": "SLOT_07_00",
      "time": "07:00 - 09:00",
      "capacity": 50,
      "booked": 48,
      "available": 2,
      "status": "AVAILABLE" // or "FULL"
    },
    {
      "timeSlot": "SLOT_09_00",
      "time": "09:00 - 11:00",
      "capacity": 50,
      "booked": 50,
      "available": 0,
      "status": "FULL"
    }
  ]
}
```

### 4.2. Database Query (JPA/Hibernate)
Cần thêm method vào `AppointmentRepository`:
```java
@Query("SELECT a.scheduledTimeSlot, COUNT(a) FROM Appointment a " +
       "WHERE a.center.id = :centerId AND a.scheduledDate = :date " +
       "AND a.status != 'CANCELLED' " +
       "GROUP BY a.scheduledTimeSlot")
List<Object[]> countAppointmentsBySlot(@Param("centerId") Long centerId, @Param("date") LocalDate date);
```

## 5. Bước tiếp theo
Bạn muốn bắt đầu với **Giai đoạn 1 (Backend API)** hay **Giai đoạn 2 (Frontend UI)** trước?
Khuyến nghị: **Giai đoạn 1** để đảm bảo logic lõi trước.
