import { TIME_SLOT_LABELS } from '@/constants';

/**
 * Format appointment time for display
 * Prioritizes actualScheduledTime, falls back to scheduledTimeSlot
 * @param {Object} appointment - Appointment object
 * @returns {string} Formatted time string
 */
export const formatAppointmentTime = (appointment) => {
  if (!appointment) return 'N/A';

  // If actualScheduledTime exists (15-minute precise time set by Cashier)
  if (appointment.actualScheduledTime) {
    // Format to HH:mm (remove seconds if present)
    return appointment.actualScheduledTime.substring(0, 5);
  }

  // If scheduledTimeSlot exists (2-hour time slot)
  if (appointment.scheduledTimeSlot) {
    return TIME_SLOT_LABELS[appointment.scheduledTimeSlot] || appointment.scheduledTimeSlot;
  }

  return 'Chưa xếp lịch';
};

/**
 * Format desired time for reschedule
 * @param {Object} appointment - Appointment object
 * @returns {string} Formatted time string
 */
export const formatDesiredTime = (appointment) => {
  if (!appointment) return 'N/A';

  // If actualDesiredTime exists
  if (appointment.actualDesiredTime) {
    // Format to HH:mm (remove seconds if present)
    return appointment.actualDesiredTime.substring(0, 5);
  }

  // If desiredTimeSlot exists
  if (appointment.desiredTimeSlot) {
    return TIME_SLOT_LABELS[appointment.desiredTimeSlot] || appointment.desiredTimeSlot;
  }

  return 'N/A';
};

/**
 * Get appointment time display with icon
 * @param {Object} appointment - Appointment object
 * @returns {Object} { time, isExact } - time string and whether it's exact time
 */
export const getAppointmentTimeDisplay = (appointment) => {
  if (!appointment) return { time: 'N/A', isExact: false };

  if (appointment.actualScheduledTime) {
    return {
      time: appointment.actualScheduledTime.substring(0, 5), // Format to HH:mm
      isExact: true,
      label: 'Giờ chính thức',
    };
  }

  if (appointment.scheduledTimeSlot) {
    return {
      time: TIME_SLOT_LABELS[appointment.scheduledTimeSlot] || appointment.scheduledTimeSlot,
      isExact: false,
      label: 'Khung giờ',
    };
  }

  return { time: 'Chưa xếp lịch', isExact: false, label: '' };
};
