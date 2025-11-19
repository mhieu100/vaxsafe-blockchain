-- ============================================
-- V4 Migration: Seed Doctor Data for Testing
-- Migrate existing doctors to new schema + Create schedules + Generate slots
-- ============================================

-- ============================================
-- 1. MIGRATE EXISTING DOCTORS FROM USERS TABLE
-- ============================================
-- Migrate doctors from users table to doctors table
INSERT INTO doctors (user_id, center_id, license_number, specialization, consultation_duration, max_patients_per_day, is_available)
SELECT 
    u.id,
    u.center_id,
    CONCAT('BYT-', LPAD(u.id::TEXT, 6, '0')), -- Generate license number: BYT-000001
    CASE 
        WHEN u.id % 3 = 0 THEN 'Tiêm chủng trẻ em'
        WHEN u.id % 3 = 1 THEN 'Tiêm chủng người lớn'
        ELSE 'Tiêm chủng tổng hợp'
    END as specialization,
    30, -- Default 30 minutes per appointment
    20, -- Max 20 patients per day
    TRUE
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'DOCTOR'
  AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 2. CREATE WEEKLY SCHEDULES FOR ALL DOCTORS
-- ============================================
-- Create standard working schedule for all doctors
-- Monday to Friday: 8:00-12:00 (morning) and 14:00-17:00 (afternoon)
-- Saturday: 8:00-12:00 (morning only)

DO $$
DECLARE
    doctor_record RECORD;
BEGIN
    FOR doctor_record IN SELECT doctor_id FROM doctors WHERE is_available = TRUE
    LOOP
        -- Monday to Friday (day 1-5): Morning shift
        INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
        VALUES 
            (doctor_record.doctor_id, 1, '08:00', '12:00', TRUE), -- Monday morning
            (doctor_record.doctor_id, 1, '14:00', '17:00', TRUE), -- Monday afternoon
            (doctor_record.doctor_id, 2, '08:00', '12:00', TRUE), -- Tuesday morning
            (doctor_record.doctor_id, 2, '14:00', '17:00', TRUE), -- Tuesday afternoon
            (doctor_record.doctor_id, 3, '08:00', '12:00', TRUE), -- Wednesday morning
            (doctor_record.doctor_id, 3, '14:00', '17:00', TRUE), -- Wednesday afternoon
            (doctor_record.doctor_id, 4, '08:00', '12:00', TRUE), -- Thursday morning
            (doctor_record.doctor_id, 4, '14:00', '17:00', TRUE), -- Thursday afternoon
            (doctor_record.doctor_id, 5, '08:00', '12:00', TRUE), -- Friday morning
            (doctor_record.doctor_id, 5, '14:00', '17:00', TRUE), -- Friday afternoon
            (doctor_record.doctor_id, 6, '08:00', '12:00', TRUE)  -- Saturday morning only
        ON CONFLICT (doctor_id, day_of_week, start_time, end_time) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- 3. CREATE SOME SPECIAL SCHEDULES (EXAMPLES)
-- ============================================
-- Example: Some doctors have special schedule on specific dates
INSERT INTO doctor_special_schedules (doctor_id, work_date, start_time, end_time, reason)
SELECT 
    d.doctor_id,
    CURRENT_DATE + INTERVAL '7 days', -- Next week
    '10:00'::TIME,
    '14:00'::TIME,
    'Họp hội nghị khoa học buổi sáng'
FROM doctors d
WHERE d.doctor_id IN (1, 5, 10) -- Only first 3 doctors
ON CONFLICT (doctor_id, work_date) DO NOTHING;

-- ============================================
-- 4. CREATE SOME LEAVE RECORDS (EXAMPLES)
-- ============================================
-- Example: Some doctors on leave
INSERT INTO doctor_leave (doctor_id, start_date, end_date, reason, leave_type, status)
SELECT 
    d.doctor_id,
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '5 days',
    'Nghỉ phép năm',
    'VACATION',
    'APPROVED'
FROM doctors d
WHERE d.doctor_id IN (2, 7) -- Only 2 doctors on leave
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. GENERATE SLOTS FOR NEXT 60 DAYS
-- ============================================
-- Call the stored procedure to generate slots for all doctors
DO $$
DECLARE
    doctor_record RECORD;
    v_start_date DATE := CURRENT_DATE;
    v_end_date DATE := CURRENT_DATE + INTERVAL '60 days';
    v_current_date DATE;
    v_day_of_week INTEGER;
    v_is_on_leave BOOLEAN;
    v_schedule RECORD;
    v_special_schedule RECORD;
    v_slot_start TIME;
    v_slot_end TIME;
    v_consultation_duration INTEGER;
BEGIN
    -- Loop through all available doctors
    FOR doctor_record IN SELECT doctor_id, consultation_duration FROM doctors WHERE is_available = TRUE
    LOOP
        v_consultation_duration := doctor_record.consultation_duration;
        v_current_date := v_start_date;
        
        -- Loop through each date
        WHILE v_current_date <= v_end_date LOOP
            -- Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
            v_day_of_week := EXTRACT(DOW FROM v_current_date);
            
            -- Check if doctor is on leave
            SELECT EXISTS(
                SELECT 1 FROM doctor_leave
                WHERE doctor_id = doctor_record.doctor_id
                  AND v_current_date BETWEEN start_date AND end_date
                  AND status = 'APPROVED'
            ) INTO v_is_on_leave;
            
            IF NOT v_is_on_leave THEN
                -- Check for special schedule first
                SELECT * INTO v_special_schedule
                FROM doctor_special_schedules
                WHERE doctor_id = doctor_record.doctor_id
                  AND work_date = v_current_date;
                
                IF FOUND THEN
                    -- Use special schedule
                    v_slot_start := v_special_schedule.start_time;
                    WHILE v_slot_start < v_special_schedule.end_time LOOP
                        v_slot_end := v_slot_start + (v_consultation_duration || ' minutes')::INTERVAL;
                        IF v_slot_end <= v_special_schedule.end_time THEN
                            INSERT INTO doctor_available_slots (doctor_id, slot_date, start_time, end_time, status)
                            VALUES (doctor_record.doctor_id, v_current_date, v_slot_start, v_slot_end, 'AVAILABLE')
                            ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
                        END IF;
                        v_slot_start := v_slot_end;
                    END LOOP;
                ELSE
                    -- Use normal weekly schedule
                    FOR v_schedule IN
                        SELECT start_time, end_time
                        FROM doctor_schedules
                        WHERE doctor_id = doctor_record.doctor_id
                          AND day_of_week = v_day_of_week
                          AND is_active = TRUE
                    LOOP
                        v_slot_start := v_schedule.start_time;
                        WHILE v_slot_start < v_schedule.end_time LOOP
                            v_slot_end := v_slot_start + (v_consultation_duration || ' minutes')::INTERVAL;
                            IF v_slot_end <= v_schedule.end_time THEN
                                INSERT INTO doctor_available_slots (doctor_id, slot_date, start_time, end_time, status)
                                VALUES (doctor_record.doctor_id, v_current_date, v_slot_start, v_slot_end, 'AVAILABLE')
                                ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
                            END IF;
                            v_slot_start := v_slot_end;
                        END LOOP;
                    END LOOP;
                END IF;
            END IF;
            
            v_current_date := v_current_date + 1;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================
-- Count migrated doctors
DO $$
DECLARE
    v_doctor_count INTEGER;
    v_schedule_count INTEGER;
    v_slot_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_doctor_count FROM doctors;
    SELECT COUNT(*) INTO v_schedule_count FROM doctor_schedules;
    SELECT COUNT(*) INTO v_slot_count FROM doctor_available_slots;
    
    RAISE NOTICE 'Migration V4 completed successfully!';
    RAISE NOTICE '  - Doctors migrated: %', v_doctor_count;
    RAISE NOTICE '  - Schedules created: %', v_schedule_count;
    RAISE NOTICE '  - Slots generated: %', v_slot_count;
END $$;

-- ============================================
-- 7. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date_status 
ON doctor_available_slots(slot_date, status) 
WHERE status = 'AVAILABLE';

CREATE INDEX IF NOT EXISTS idx_doctor_slots_doctor_date_status 
ON doctor_available_slots(doctor_id, slot_date, status);

-- ============================================
-- 8. COMMENTS
-- ============================================
COMMENT ON TABLE doctors IS 'Extended doctor profiles with scheduling settings - migrated from users table';
COMMENT ON TABLE doctor_schedules IS 'Weekly recurring schedule templates for doctors';
COMMENT ON TABLE doctor_available_slots IS 'Pre-generated time slots for booking appointments';
