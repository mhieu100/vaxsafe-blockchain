-- ========================================
-- CLEAR TEST DATA SCRIPT
-- ========================================
-- This script clears all test appointments, bookings, reminders, and payments
-- Use this to reset the database before running tests

-- Step 1: Release all doctor slots associated with appointments
UPDATE doctor_available_slots 
SET appointment_id = NULL, status = 'AVAILABLE'
WHERE appointment_id IN (
    SELECT id FROM appointments
);

-- Step 2: Delete vaccination reminders
DELETE FROM vaccination_reminders 
WHERE appointment_id IN (
    SELECT id FROM appointments
);

-- Also delete next dose reminders (those without appointment_id)
DELETE FROM vaccination_reminders 
WHERE reminder_type = 'NEXT_DOSE_REMINDER';

-- Step 3: Delete notification logs
DELETE FROM notification_logs;

-- Step 4: Delete payments linked to appointments
DELETE FROM payments 
WHERE reference_id IN (
    SELECT id FROM appointments
);

-- Step 5: Delete appointments
DELETE FROM appointments;

-- Step 6: Delete bookings
DELETE FROM bookings;

-- Step 7: Delete vaccine records (if any were created during testing)
DELETE FROM vaccine_records 
WHERE appointment_id NOT IN (
    SELECT id FROM appointments
);

-- Verify cleanup
SELECT 'Appointments remaining:' as status, COUNT(*) as count FROM appointments
UNION ALL
SELECT 'Bookings remaining:' as status, COUNT(*) as count FROM bookings
UNION ALL
SELECT 'Vaccination reminders remaining:' as status, COUNT(*) as count FROM vaccination_reminders
UNION ALL
SELECT 'Notification logs remaining:' as status, COUNT(*) as count FROM notification_logs
UNION ALL
SELECT 'Payments remaining:' as status, COUNT(*) as count FROM payments
UNION ALL
SELECT 'Doctor slots with appointments:' as status, COUNT(*) as count FROM doctor_available_slots WHERE appointment_id IS NOT NULL;
