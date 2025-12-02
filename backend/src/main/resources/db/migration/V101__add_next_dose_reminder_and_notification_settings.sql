-- Add ReminderType and update VaccinationReminder table
ALTER TABLE vaccination_reminders 
ADD COLUMN reminder_type VARCHAR(50) DEFAULT 'APPOINTMENT_REMINDER' NOT NULL,
ADD COLUMN vaccine_id BIGINT,
ADD COLUMN next_dose_number INTEGER,
ALTER COLUMN appointment_id DROP NOT NULL;

-- Add constraint for ReminderType
ALTER TABLE vaccination_reminders
ADD CONSTRAINT check_reminder_type CHECK (reminder_type IN ('APPOINTMENT_REMINDER', 'NEXT_DOSE_REMINDER'));

-- Create UserNotificationSettings table
CREATE TABLE user_notification_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    zalo_enabled BOOLEAN DEFAULT FALSE,
    preferred_channel VARCHAR(50) DEFAULT 'EMAIL',
    appointment_reminder_enabled BOOLEAN DEFAULT TRUE,
    next_dose_reminder_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create NotificationLogs table
CREATE TABLE notification_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    appointment_id BIGINT,
    reminder_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    recipient VARCHAR(255),
    content TEXT,
    error_message TEXT,
    dose_number INTEGER,
    vaccine_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Create indexes for NotificationLogs
CREATE INDEX idx_notification_logs_user_type_sent ON notification_logs(user_id, reminder_type, sent_at);
CREATE INDEX idx_notification_logs_appointment_channel ON notification_logs(appointment_id, channel);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Add comments
COMMENT ON TABLE user_notification_settings IS 'User preferences for receiving notifications';
COMMENT ON TABLE notification_logs IS 'Log of all notifications sent to prevent spam and duplicates';
COMMENT ON COLUMN vaccination_reminders.reminder_type IS 'Type: APPOINTMENT_REMINDER or NEXT_DOSE_REMINDER';
COMMENT ON COLUMN vaccination_reminders.vaccine_id IS 'For NEXT_DOSE_REMINDER: vaccine for next dose';
COMMENT ON COLUMN vaccination_reminders.next_dose_number IS 'For NEXT_DOSE_REMINDER: dose number (2, 3, etc)';
