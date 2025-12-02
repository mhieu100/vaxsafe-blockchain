-- Create vaccination_reminders table
CREATE TABLE IF NOT EXISTS vaccination_reminders (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    channel VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    days_before INTEGER NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    recipient_zalo_id VARCHAR(255),
    message TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reminder_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_channel CHECK (channel IN ('EMAIL')),
    CONSTRAINT check_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED'))
);

-- Create indexes for better query performance
CREATE INDEX idx_reminders_appointment ON vaccination_reminders(appointment_id);
CREATE INDEX idx_reminders_user ON vaccination_reminders(user_id);
CREATE INDEX idx_reminders_status ON vaccination_reminders(status);
CREATE INDEX idx_reminders_scheduled_date ON vaccination_reminders(scheduled_date);
CREATE INDEX idx_reminders_channel ON vaccination_reminders(channel);
CREATE INDEX idx_reminders_next_retry ON vaccination_reminders(next_retry_at) WHERE status = 'FAILED';

-- Add comment to table
COMMENT ON TABLE vaccination_reminders IS 'Stores vaccination appointment reminders sent via email';
COMMENT ON COLUMN vaccination_reminders.channel IS 'Communication channel: EMAIL only';
COMMENT ON COLUMN vaccination_reminders.status IS 'Reminder status: PENDING, SENT, FAILED, or CANCELLED';
COMMENT ON COLUMN vaccination_reminders.days_before IS 'Number of days before appointment to send reminder';
COMMENT ON COLUMN vaccination_reminders.retry_count IS 'Number of retry attempts for failed reminders';
