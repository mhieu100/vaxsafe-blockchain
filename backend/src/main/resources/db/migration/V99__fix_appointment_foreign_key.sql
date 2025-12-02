-- Fix foreign key constraint issue when deleting appointments
-- Set appointment_id to NULL in doctor_available_slots before deleting appointments

-- First, clear appointment references in slots
UPDATE doctor_available_slots 
SET appointment_id = NULL, 
    status = 'AVAILABLE'
WHERE appointment_id IN (
    SELECT id FROM appointments WHERE id IN (12,11)
);

-- Now can safely delete appointments
-- DELETE FROM appointments WHERE id IN (1, 2);
-- Commented out - let application handle deletion

-- Alter constraint to support ON DELETE SET NULL for future deletions
ALTER TABLE doctor_available_slots 
DROP CONSTRAINT IF EXISTS fkkilodrhvgd3fgyvqfotlj4r5b;

ALTER TABLE doctor_available_slots 
ADD CONSTRAINT fkkilodrhvgd3fgyvqfotlj4r5b 
FOREIGN KEY (appointment_id) 
REFERENCES appointments(id) 
ON DELETE SET NULL;
