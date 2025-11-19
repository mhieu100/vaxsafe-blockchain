-- Migration V3: Create Doctor Schedule Management System
-- Based on DATABASE_DESIGN.md

-- ============================================
-- 1. CREATE DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    center_id BIGINT NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    consultation_duration INTEGER DEFAULT 30, -- Duration per appointment in minutes
    max_patients_per_day INTEGER DEFAULT 20,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctors_center FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    CONSTRAINT chk_consultation_duration CHECK (consultation_duration IN (15, 30, 45, 60))
);

CREATE INDEX idx_doctors_user ON doctors(user_id);
CREATE INDEX idx_doctors_center ON doctors(center_id);
CREATE INDEX idx_doctors_available ON doctors(is_available) WHERE is_available = TRUE;

COMMENT ON TABLE doctors IS 'Store doctor information and settings';
COMMENT ON COLUMN doctors.consultation_duration IS 'Duration per appointment slot in minutes (15, 30, 45, 60)';
COMMENT ON COLUMN doctors.max_patients_per_day IS 'Maximum number of patients per day';
COMMENT ON COLUMN doctors.is_available IS 'Whether doctor is accepting appointments (false = on long leave)';

-- ============================================
-- 2. CREATE DOCTOR_SCHEDULES TABLE (Weekly Template)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_schedules (
    schedule_id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doctor_schedules_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT chk_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time),
    CONSTRAINT uk_doctor_schedule UNIQUE (doctor_id, day_of_week, start_time, end_time)
);

CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX idx_doctor_schedules_active ON doctor_schedules(doctor_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE doctor_schedules IS 'Weekly recurring schedule template for doctors';
COMMENT ON COLUMN doctor_schedules.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday';

-- ============================================
-- 3. CREATE DOCTOR_SPECIAL_SCHEDULES TABLE (Date Override)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_special_schedules (
    special_schedule_id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_special_schedules_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT chk_special_time CHECK (end_time > start_time),
    CONSTRAINT uk_doctor_special_date UNIQUE (doctor_id, work_date)
);

CREATE INDEX idx_special_schedules_doctor_date ON doctor_special_schedules(doctor_id, work_date);

COMMENT ON TABLE doctor_special_schedules IS 'Override normal schedule for specific dates (e.g., working shorter hours)';

-- ============================================
-- 4. CREATE DOCTOR_LEAVE TABLE (Days Off)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_leave (
    leave_id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    leave_type VARCHAR(50) DEFAULT 'personal', -- personal, sick, vacation, conference
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_leave_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_approver FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_leave_type CHECK (leave_type IN ('personal', 'sick', 'vacation', 'conference', 'other')),
    CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_leave_doctor_dates ON doctor_leave(doctor_id, start_date, end_date);
CREATE INDEX idx_leave_status ON doctor_leave(status) WHERE status = 'pending';

COMMENT ON TABLE doctor_leave IS 'Track doctor leave/days off';

-- ============================================
-- 5. CREATE DOCTOR_AVAILABLE_SLOTS TABLE (Core Scheduling)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_available_slots (
    slot_id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, booked, blocked
    appointment_id BIGINT,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_slots_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT fk_slots_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT chk_slot_time CHECK (end_time > start_time),
    CONSTRAINT chk_slot_status CHECK (status IN ('available', 'booked', 'blocked')),
    CONSTRAINT uk_doctor_slot_time UNIQUE (doctor_id, slot_date, start_time)
);

CREATE INDEX idx_slots_doctor_date ON doctor_available_slots(doctor_id, slot_date);
CREATE INDEX idx_slots_available ON doctor_available_slots(doctor_id, slot_date, status) WHERE status = 'available';
CREATE INDEX idx_slots_date_range ON doctor_available_slots(slot_date, status);

COMMENT ON TABLE doctor_available_slots IS 'Individual time slots generated from doctor schedules - core table for booking';
COMMENT ON COLUMN doctor_available_slots.status IS 'available: can book, booked: has appointment, blocked: unavailable';

-- ============================================
-- 6. UPDATE APPOINTMENTS TABLE
-- ============================================
-- Add slot_id reference to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS slot_id BIGINT,
ADD CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES doctor_available_slots(slot_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments(slot_id);

COMMENT ON COLUMN appointments.slot_id IS 'Reference to doctor_available_slots when appointment is scheduled';

-- Update the status check constraint to allow PENDING_APPROVAL
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('PENDING_SCHEDULE', 'PENDING_APPROVAL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'));

-- ============================================
-- 7. CREATE TRIGGER TO UPDATE SLOT STATUS
-- ============================================
CREATE OR REPLACE FUNCTION update_slot_on_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When appointment is assigned to a slot
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.slot_id IS NOT NULL THEN
        -- Mark slot as booked if appointment is scheduled
        IF NEW.status IN ('SCHEDULED', 'PENDING_APPROVAL') THEN
            UPDATE doctor_available_slots 
            SET status = 'booked', 
                appointment_id = NEW.id,
                updated_at = CURRENT_TIMESTAMP
            WHERE slot_id = NEW.slot_id;
        END IF;
    END IF;
    
    -- When appointment is cancelled or completed, release the slot
    IF (TG_OP = 'UPDATE') AND NEW.status IN ('CANCELLED', 'COMPLETED') AND NEW.slot_id IS NOT NULL THEN
        UPDATE doctor_available_slots 
        SET status = 'available', 
            appointment_id = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE slot_id = NEW.slot_id;
    END IF;
    
    -- When old slot is changed to new slot
    IF (TG_OP = 'UPDATE') AND OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
        -- Release old slot
        IF OLD.slot_id IS NOT NULL THEN
            UPDATE doctor_available_slots 
            SET status = 'available', 
                appointment_id = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE slot_id = OLD.slot_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_appointment_slot_update ON appointments;
CREATE TRIGGER trigger_appointment_slot_update
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_slot_on_appointment_change();

COMMENT ON FUNCTION update_slot_on_appointment_change IS 'Automatically update slot status when appointment changes';

-- ============================================
-- 8. CREATE STORED PROCEDURE TO GENERATE SLOTS
-- ============================================
CREATE OR REPLACE FUNCTION generate_doctor_slots(
    p_doctor_id BIGINT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    generated_slots INTEGER,
    message TEXT
) AS $$
DECLARE
    v_current_date DATE;
    v_day_of_week INTEGER;
    v_doctor_duration INTEGER;
    v_schedule RECORD;
    v_special_schedule RECORD;
    v_slot_start TIME;
    v_slot_end TIME;
    v_is_on_leave BOOLEAN;
    v_slots_count INTEGER := 0;
BEGIN
    -- Get doctor's consultation duration
    SELECT consultation_duration INTO v_doctor_duration
    FROM doctors
    WHERE doctor_id = p_doctor_id AND is_available = TRUE;
    
    IF v_doctor_duration IS NULL THEN
        RETURN QUERY SELECT 0, 'Doctor not found or not available'::TEXT;
        RETURN;
    END IF;
    
    -- Loop through each date
    v_current_date := p_start_date;
    WHILE v_current_date <= p_end_date LOOP
        -- Get day of week (0=Sunday, 1=Monday, ...)
        v_day_of_week := EXTRACT(DOW FROM v_current_date);
        
        -- Check if doctor is on leave
        SELECT EXISTS(
            SELECT 1 FROM doctor_leave
            WHERE doctor_id = p_doctor_id
              AND v_current_date BETWEEN start_date AND end_date
              AND status = 'approved'
        ) INTO v_is_on_leave;
        
        IF NOT v_is_on_leave THEN
            -- Check for special schedule first (overrides normal schedule)
            SELECT * INTO v_special_schedule
            FROM doctor_special_schedules
            WHERE doctor_id = p_doctor_id
              AND work_date = v_current_date;
            
            IF FOUND THEN
                -- Use special schedule
                v_slot_start := v_special_schedule.start_time;
                WHILE v_slot_start < v_special_schedule.end_time LOOP
                    v_slot_end := v_slot_start + (v_doctor_duration || ' minutes')::INTERVAL;
                    IF v_slot_end <= v_special_schedule.end_time THEN
                        INSERT INTO doctor_available_slots (doctor_id, slot_date, start_time, end_time, status)
                        VALUES (p_doctor_id, v_current_date, v_slot_start, v_slot_end, 'available')
                        ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
                        v_slots_count := v_slots_count + 1;
                    END IF;
                    v_slot_start := v_slot_end;
                END LOOP;
            ELSE
                -- Use normal weekly schedule
                FOR v_schedule IN
                    SELECT start_time, end_time
                    FROM doctor_schedules
                    WHERE doctor_id = p_doctor_id
                      AND day_of_week = v_day_of_week
                      AND is_active = TRUE
                LOOP
                    v_slot_start := v_schedule.start_time;
                    WHILE v_slot_start < v_schedule.end_time LOOP
                        v_slot_end := v_slot_start + (v_doctor_duration || ' minutes')::INTERVAL;
                        IF v_slot_end <= v_schedule.end_time THEN
                            INSERT INTO doctor_available_slots (doctor_id, slot_date, start_time, end_time, status)
                            VALUES (p_doctor_id, v_current_date, v_slot_start, v_slot_end, 'available')
                            ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING;
                            v_slots_count := v_slots_count + 1;
                        END IF;
                        v_slot_start := v_slot_end;
                    END LOOP;
                END LOOP;
            END IF;
        END IF;
        
        v_current_date := v_current_date + 1;
    END LOOP;
    
    RETURN QUERY SELECT v_slots_count, 'Successfully generated slots'::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_doctor_slots IS 'Generate time slots for a doctor within date range based on their schedules';

-- ============================================
-- 9. CREATE HELPER FUNCTION TO GET AVAILABLE SLOTS
-- ============================================
CREATE OR REPLACE FUNCTION get_available_slots(
    p_doctor_id BIGINT,
    p_date DATE
)
RETURNS TABLE(
    slot_id BIGINT,
    slot_date DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.slot_id,
        s.slot_date,
        s.start_time,
        s.end_time,
        s.status
    FROM doctor_available_slots s
    WHERE s.doctor_id = p_doctor_id
      AND s.slot_date = p_date
      AND s.status = 'available'
    ORDER BY s.start_time;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_slots IS 'Get all available slots for a doctor on a specific date';

-- ============================================
-- 10. CREATE VIEW FOR STATISTICS
-- ============================================
CREATE OR REPLACE VIEW v_doctor_slot_statistics AS
SELECT 
    d.doctor_id,
    u.full_name as doctor_name,
    c.name as center_name,
    d.is_available,
    COUNT(CASE WHEN s.status = 'available' THEN 1 END) as available_slots,
    COUNT(CASE WHEN s.status = 'booked' THEN 1 END) as booked_slots,
    COUNT(CASE WHEN s.status = 'blocked' THEN 1 END) as blocked_slots,
    COUNT(s.slot_id) as total_slots,
    ROUND(
        COUNT(CASE WHEN s.status = 'booked' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(s.slot_id), 0) * 100, 
        2
    ) as utilization_rate
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN centers c ON d.center_id = c.id
LEFT JOIN doctor_available_slots s ON d.doctor_id = s.doctor_id 
    AND s.slot_date >= CURRENT_DATE
    AND s.slot_date <= CURRENT_DATE + INTERVAL '30 days'
GROUP BY d.doctor_id, u.full_name, c.name, d.is_available;

COMMENT ON VIEW v_doctor_slot_statistics IS 'Statistics of doctor slots for next 30 days';

-- ============================================
-- 11. MIGRATE EXISTING DATA
-- ============================================
-- This will migrate existing doctor users to the doctors table
INSERT INTO doctors (user_id, center_id, license_number, consultation_duration, is_available)
SELECT 
    u.id,
    COALESCE(u.center_id, 1), -- Default to center 1 if null
    NULL, -- License number to be filled manually
    30, -- Default 30 minutes
    TRUE
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'DOCTOR'
ON CONFLICT (user_id) DO NOTHING;

-- Update existing appointments to link to doctor table
-- (This assumes appointments.doctor_id currently references users.id)
-- Note: slot_id will be NULL until cashier re-assigns using new system

COMMENT ON TABLE doctors IS 'Extended doctor profile with scheduling settings';
