-- ==========================================
-- OPTIMIZATION FOR VIRTUAL TIME SLOT MECHANISM
-- File: V999__optimize_virtual_slots.sql
-- Description: Tối ưu database cho cơ chế Virtual Time Slots
-- ==========================================

-- 1. Tạo composite index cho query performance
-- Index này giúp query findDoctorSlotsInRange chạy nhanh hơn
CREATE INDEX IF NOT EXISTS idx_slot_doctor_date_status 
ON doctor_available_slots(doctor_id, slot_date, status, start_time);

-- 2. Index cho batch query multiple doctors
CREATE INDEX IF NOT EXISTS idx_slot_doctors_date_range 
ON doctor_available_slots(slot_date, doctor_id, start_time)
WHERE status IN ('BOOKED', 'BLOCKED');

-- 3. Index cho doctor schedules lookup
CREATE INDEX IF NOT EXISTS idx_schedule_doctor_day 
ON doctor_schedules(doctor_id, day_of_week, is_active)
WHERE is_active = true;

-- 4. Xóa các slots AVAILABLE cũ (không cần thiết với Virtual Slots)
-- CẢNH BÁO: Backup trước khi chạy lệnh này!
-- Uncomment dòng dưới khi đã backup xong
-- DELETE FROM doctor_available_slots WHERE status = 'AVAILABLE';

-- 5. Thêm check constraint để đảm bảo chỉ lưu BOOKED/BLOCKED
-- ALTER TABLE doctor_available_slots 
-- ADD CONSTRAINT chk_slot_status_no_available 
-- CHECK (status IN ('BOOKED', 'BLOCKED'));

-- 6. Comment giải thích cho developers
COMMENT ON INDEX idx_slot_doctor_date_status IS 
'Composite index for Virtual Time Slot queries. Optimize findDoctorSlotsInRange performance.';

COMMENT ON INDEX idx_slot_doctors_date_range IS 
'Index for batch queries when fetching slots for multiple doctors (center view).';

COMMENT ON INDEX idx_schedule_doctor_day IS 
'Index for fast doctor schedule lookup by day of week.';

-- 7. Analyze tables để cập nhật statistics
ANALYZE doctor_available_slots;
ANALYZE doctor_schedules;

-- 8. Vacuum để clean up
VACUUM ANALYZE doctor_available_slots;
