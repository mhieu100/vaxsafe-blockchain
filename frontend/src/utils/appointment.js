import { TIME_SLOT_LABELS } from '@/constants';

export const formatAppointmentTime = (appointment) => {
  if (!appointment) return 'N/A';

  if (appointment.actualScheduledTime) {
    return appointment.actualScheduledTime.substring(0, 5);
  }

  if (appointment.scheduledTimeSlot) {
    return TIME_SLOT_LABELS[appointment.scheduledTimeSlot] || appointment.scheduledTimeSlot;
  }

  return 'Chưa xếp lịch';
};

export const formatDesiredTime = (appointment) => {
  if (!appointment) return 'N/A';

  if (appointment.actualDesiredTime) {
    return appointment.actualDesiredTime.substring(0, 5);
  }

  if (appointment.desiredTimeSlot) {
    return TIME_SLOT_LABELS[appointment.desiredTimeSlot] || appointment.desiredTimeSlot;
  }

  return 'N/A';
};

export const getAppointmentTimeDisplay = (appointment) => {
  if (!appointment) return { time: 'N/A', isExact: false };

  if (appointment.actualScheduledTime) {
    return {
      time: appointment.actualScheduledTime.substring(0, 5),
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
