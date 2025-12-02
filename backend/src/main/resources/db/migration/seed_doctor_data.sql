-- ============================================
-- V4 Migration: Seed Doctor Data for Testing
-- Migrate existing doctors to new schema + Generate slots
--
-- UPDATED LOGIC:
-- - Default working hours: 7:00 - 17:00 (all days)
-- - Slot duration: 30 minutes
-- - No doctor_schedules required (optional table)
-- - System auto-generates 20 slots/day (7:00-17:00)
-- ============================================

-- ============================================
-- 1. MIGRATE EXISTING DOCTORS FROM USERS TABLE
-- ============================================
-- Migrate doctors from users table to doctors table
INSERT INTO
    doctors (
        user_id,
        center_id,
        license_number,
        specialization,
        consultation_duration,
        max_patients_per_day,
        is_available
    )
SELECT
    u.id,
    u.center_id,
    CONCAT(
        'BYT-',
        LPAD(u.id::TEXT, 6, '0')
    ), -- Generate license number: BYT-000001
    CASE
        WHEN u.id % 3 = 0 THEN 'Tiêm chủng trẻ em'
        WHEN u.id % 3 = 1 THEN 'Tiêm chủng người lớn'
        ELSE 'Tiêm chủng tổng hợp'
    END as specialization,
    30, -- Default 30 minutes per slot
    20, -- Max 20 patients per day (20 slots x 30 min = 10 hours)
    TRUE
FROM users u
    JOIN roles r ON u.role_id = r.id
WHERE
    r.name = 'DOCTOR'
    AND NOT EXISTS (
        SELECT 1
        FROM doctors d
        WHERE
            d.user_id = u.id
    )
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 2. SKIP DOCTOR_SCHEDULES (OPTIONAL TABLE)
-- ============================================
-- doctor_schedules table is now OPTIONAL
-- If no schedule exists, system will use default: 7:00-17:00 every day
-- Uncomment below if you want custom schedules for specific doctors

/*
-- Example: Custom schedule for doctor_id = 1
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
VALUES 
(1, 1, '08:00', '12:00', TRUE),  -- Monday morning
(1, 1, '14:00', '18:00', TRUE);  -- Monday afternoon
*/

-- ============================================
-- 3. GENERATE SLOTS FOR NEXT 60 DAYS
-- ============================================
-- Generate slots with NEW LOGIC:
-- - If no doctor_schedules exist: use default 7:00-17:00
-- - If doctor_schedules exist: use custom hours
-- - Slot duration: 30 minutes (from doctor.consultation_duration)
DO $$
DECLARE
    doctor_record RECORD;
    v_start_date DATE := CURRENT_DATE;
    v_end_date DATE := CURRENT_DATE + INTERVAL '60 days';
    v_current_date DATE;
    v_day_of_week INTEGER;
    v_schedule RECORD;
    v_slot_start TIME;
    v_slot_end TIME;
    v_consultation_duration INTEGER;
    v_schedule_count INTEGER;
    v_default_start TIME := '07:00';
    v_default_end TIME := '17:00';
BEGIN
    -- Loop through all available doctors
    FOR doctor_record IN 
        SELECT doctor_id, consultation_duration 
        FROM doctors 
        WHERE is_available = TRUE
    LOOP
        v_consultation_duration := COALESCE(doctor_record.consultation_duration, 15);
        v_current_date := v_start_date;
        
        -- Loop through each date
        WHILE v_current_date <= v_end_date LOOP
            -- Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
            v_day_of_week := EXTRACT(DOW FROM v_current_date);
            
            -- Check if custom schedule exists for this doctor and day
            SELECT COUNT(*) INTO v_schedule_count
            FROM doctor_schedules
            WHERE doctor_id = doctor_record.doctor_id
              AND day_of_week = v_day_of_week
              AND is_active = TRUE;
            
            IF v_schedule_count = 0 THEN
                -- NO CUSTOM SCHEDULE: Use default 7:00-17:00
                v_slot_start := v_default_start;
                WHILE v_slot_start < v_default_end LOOP
                    v_slot_end := v_slot_start + (v_consultation_duration || ' minutes')::INTERVAL;
                    IF v_slot_end <= v_default_end THEN
                        INSERT INTO doctor_available_slots (doctor_id, slot_date, start_time, end_time, status)
                        VALUES (doctor_record.doctor_id, v_current_date, v_slot_start, v_slot_end, 'AVAILABLE')
                        ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
                    END IF;
                    v_slot_start := v_slot_end;
                END LOOP;
            ELSE
                -- CUSTOM SCHEDULE EXISTS: Use defined hours
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
            
            v_current_date := v_current_date + 1;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 4. VERIFICATION QUERIES
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
-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date_status ON doctor_available_slots (slot_date, status)
WHERE
    status = 'AVAILABLE';

CREATE INDEX IF NOT EXISTS idx_doctor_slots_doctor_date_status ON doctor_available_slots (doctor_id, slot_date, status);

-- ============================================
-- 6. COMMENTS
-- ============================================
COMMENT ON TABLE doctors IS 'Extended doctor profiles with scheduling settings. Default: 30min slots, 7:00-17:00 every day';

COMMENT ON TABLE doctor_schedules IS 'OPTIONAL: Custom weekly schedule templates. If empty, system uses default 7:00-17:00';

COMMENT ON TABLE doctor_available_slots IS 'Pre-generated 30-minute time slots for booking appointments (7:00-17:00 = 20 slots/day)';

-- ============================================
-- 7. SUMMARY
-- ============================================
-- Migration completed with NEW SIMPLIFIED LOGIC:
-- ✓ All doctors work 7:00-17:00 by default (no doctor_schedules needed)
-- ✓ Each slot is 30 minutes (consultation_duration = 30)
-- ✓ 20 slots per day: 7:00-7:30, 7:30-8:00, ..., 16:30-17:00
-- ✓ Slots generated for next 60 days
-- ✓ Custom schedules can be added to doctor_schedules if needed