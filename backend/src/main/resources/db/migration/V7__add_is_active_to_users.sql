-- Add isActive column to users table
-- This column tracks whether user has completed their profile and activated their account

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- Set existing users with patient profiles as active
UPDATE users 
SET is_active = TRUE 
WHERE id IN (
    SELECT user_id FROM patient WHERE user_id IS NOT NULL
);

-- Add comment to column
COMMENT ON COLUMN users.is_active IS 'Indicates whether user has completed profile and activated account';
