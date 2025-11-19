-- Migration script for Reschedule Appointment feature
-- Add new columns to appointments table

-- Add columns for reschedule functionality
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS desired_date DATE,
ADD COLUMN IF NOT EXISTS desired_time TIME,
ADD COLUMN IF NOT EXISTS reschedule_reason VARCHAR(500),
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMP;

-- Add index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add index for querying pending approvals
CREATE INDEX IF NOT EXISTS idx_appointments_pending_approval
ON appointments(status, rescheduled_at)
WHERE status = 'PENDING_APPROVAL';

-- Comments for documentation
COMMENT ON COLUMN appointments.desired_date IS 'Patient desired date for rescheduled appointment';
COMMENT ON COLUMN appointments.desired_time IS 'Patient desired time for rescheduled appointment';
COMMENT ON COLUMN appointments.reschedule_reason IS 'Reason provided by patient for rescheduling';
COMMENT ON COLUMN appointments.rescheduled_at IS 'Timestamp when reschedule request was made';

