export const MIN_PRICE = 0;
export const MAX_PRICE = 3000000;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

// Time slot display labels
export const TIME_SLOT_LABELS = {
  SLOT_07_00: '7:00 - 9:00',
  SLOT_09_00: '9:00 - 11:00',
  SLOT_11_00: '11:00 - 13:00',
  SLOT_13_00: '13:00 - 15:00',
  SLOT_15_00: '15:00 - 17:00',
};

// Get time range from time slot enum (for validation)
export const getTimeSlotRange = (timeSlot) => {
  const ranges = {
    SLOT_07_00: ['07:00', '08:59'],
    SLOT_09_00: ['09:00', '10:59'],
    SLOT_11_00: ['11:00', '12:59'],
    SLOT_13_00: ['13:00', '14:59'],
    SLOT_15_00: ['15:00', '16:59'],
  };
  return ranges[timeSlot] || ['00:00', '23:59'];
};

// Format time slot for display
export const formatTimeSlot = (timeSlot) => {
  return TIME_SLOT_LABELS[timeSlot] || timeSlot;
};
