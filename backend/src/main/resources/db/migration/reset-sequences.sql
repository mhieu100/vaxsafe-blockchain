-- ========================================
-- RESET ALL SEQUENCES SCRIPT
-- ========================================
-- Run this script after manually inserting data with explicit IDs
-- This ensures sequences are synchronized with the actual max IDs in tables

-- Users
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- Centers
SELECT setval('centers_center_id_seq', (SELECT COALESCE(MAX(center_id), 1) FROM centers));

-- News
SELECT setval('news_id_seq', (SELECT COALESCE(MAX(id), 1) FROM news));

-- Vaccines
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaccines' AND column_name = 'vaccine_id') THEN
        PERFORM setval('vaccines_vaccine_id_seq', (SELECT COALESCE(MAX(vaccine_id), 1) FROM vaccines));
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaccines' AND column_name = 'id') THEN
        PERFORM setval('vaccines_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vaccines));
    END IF;
END $$;

-- Appointments
SELECT setval('appointments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM appointments));

-- Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id') THEN
        PERFORM setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_id') THEN
        PERFORM setval('bookings_booking_id_seq', (SELECT COALESCE(MAX(booking_id), 1) FROM bookings));
    END IF;
END $$;

-- Payments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'id') THEN
        PERFORM setval('payments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payments));
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_id') THEN
        PERFORM setval('payments_payment_id_seq', (SELECT COALESCE(MAX(payment_id), 1) FROM payments));
    END IF;
END $$;

-- Doctor Available Slots
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'doctor_available_slots_id_seq') THEN
        PERFORM setval('doctor_available_slots_id_seq', (SELECT COALESCE(MAX(id), 1) FROM doctor_available_slots));
    END IF;
END $$;

-- Vaccination Reminders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vaccination_reminders_id_seq') THEN
        PERFORM setval('vaccination_reminders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vaccination_reminders));
    END IF;
END $$;

-- Vaccine Records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vaccine_records_id_seq') THEN
        PERFORM setval('vaccine_records_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vaccine_records));
    END IF;
END $$;

-- Family Members
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'family_members_id_seq') THEN
        PERFORM setval('family_members_id_seq', (SELECT COALESCE(MAX(id), 1) FROM family_members));
    END IF;
END $$;

-- Notification Logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notification_logs_id_seq') THEN
        PERFORM setval('notification_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notification_logs));
    END IF;
END $$;

-- Orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'orders_id_seq') THEN
        PERFORM setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));
    END IF;
END $$;

-- Reset all sequences automatically (universal method)
DO $$
DECLARE
    seq_record RECORD;
    max_val BIGINT;
    table_name TEXT;
    column_name TEXT;
BEGIN
    FOR seq_record IN
        SELECT
            s.relname AS sequence_name,
            t.relname AS table_name,
            a.attname AS column_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON d.refobjid = t.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
        WHERE s.relkind = 'S'
    LOOP
        EXECUTE format('SELECT COALESCE(MAX(%I), 1) FROM %I', seq_record.column_name, seq_record.table_name) INTO max_val;
        EXECUTE format('SELECT setval(%L, %s)', seq_record.sequence_name, max_val);
        RAISE NOTICE 'Reset % to %', seq_record.sequence_name, max_val;
    END LOOP;
END $$;
