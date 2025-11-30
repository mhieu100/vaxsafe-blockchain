/**
 * Backend Enums - Synchronized with backend/src/main/java/com/dapp/backend/enums/
 * Last updated: 2025-12-01
 */

// AppointmentEnum.java
export const AppointmentStatus = {
  PENDING: 'PENDING',
  RESCHEDULE: 'RESCHEDULE',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// TimeSlotEnum.java
export const TimeSlot = {
  SLOT_07_00: 'SLOT_07_00',
  SLOT_09_00: 'SLOT_09_00',
  SLOT_11_00: 'SLOT_11_00',
  SLOT_13_00: 'SLOT_13_00',
  SLOT_15_00: 'SLOT_15_00',
};

export const TimeSlotDisplay = {
  SLOT_07_00: '7:00 - 9:00',
  SLOT_09_00: '9:00 - 11:00',
  SLOT_11_00: '11:00 - 13:00',
  SLOT_13_00: '13:00 - 15:00',
  SLOT_15_00: '15:00 - 17:00',
};

export const TimeSlotTime = {
  SLOT_07_00: '07:00',
  SLOT_09_00: '09:00',
  SLOT_11_00: '11:00',
  SLOT_13_00: '13:00',
  SLOT_15_00: '15:00',
};

// PaymentEnum.java
export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

// MethodPaymentEnum.java
export const PaymentMethod = {
  METAMASK: 'METAMASK',
  PAYPAL: 'PAYPAL',
  BANK: 'BANK',
  CASH: 'CASH',
};

export const PaymentMethodCurrency = {
  METAMASK: 'ETH',
  PAYPAL: 'USD',
  BANK: 'VND',
  CASH: 'VND',
};

// BookingEnum.java
export const BookingStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// BloodType.java
export const BloodType = {
  O: 'O',
  A: 'A',
  B: 'B',
  AB: 'AB',
};

// Gender.java
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

// NewsCategory.java
export const NewsCategory = {
  HEALTH_GENERAL: 'HEALTH_GENERAL',
  VACCINE_INFO: 'VACCINE_INFO',
  DISEASE_PREVENTION: 'DISEASE_PREVENTION',
  NUTRITION: 'NUTRITION',
  CHILDREN_HEALTH: 'CHILDREN_HEALTH',
  WOMEN_HEALTH: 'WOMEN_HEALTH',
  ELDERLY_CARE: 'ELDERLY_CARE',
  MEDICAL_RESEARCH: 'MEDICAL_RESEARCH',
  HEALTH_TIPS: 'HEALTH_TIPS',
  COVID_19: 'COVID_19',
  SEASONAL_DISEASES: 'SEASONAL_DISEASES',
  VACCINATION_SCHEDULE: 'VACCINATION_SCHEDULE',
};

// OrderStatus.java
export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// TypeTransactionEnum.java
export const TransactionType = {
  APPOINTMENT: 'APPOINTMENT',
  ORDER: 'ORDER',
};

// SlotStatus.java
export const SlotStatus = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
};

// Exchange rates
export const EXCHANGE_RATES = {
  USD_TO_VND: 25000, // 1 USD = 25,000 VND (update this rate as needed)
  ETH_TO_VND: 75000000, // 1 ETH ≈ 75,000,000 VND (update as needed)
};

// Utility functions
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return 'success';
    case PaymentStatus.PROCESSING:
    case PaymentStatus.INITIATED:
      return 'processing';
    case PaymentStatus.FAILED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Convert payment amount to VND based on payment method
 * @param {number} amount - Original amount
 * @param {string} method - Payment method (PAYPAL, METAMASK, etc.)
 * @returns {number} - Amount in VND
 */
export const convertToVND = (amount, method) => {
  if (!amount) return 0;

  switch (method) {
    case PaymentMethod.PAYPAL:
      return amount * EXCHANGE_RATES.USD_TO_VND;
    case PaymentMethod.METAMASK:
      return amount * EXCHANGE_RATES.ETH_TO_VND;
    case PaymentMethod.BANK:
    case PaymentMethod.CASH:
    default:
      return amount; // Already in VND
  }
};

/**
 * Format payment amount display with currency
 * @param {number} amount - Amount to display
 * @param {string} method - Payment method
 * @returns {object} - Formatted display with original and VND amounts
 */
export const formatPaymentAmount = (amount, method) => {
  if (!amount) return { display: '0 đ', vnd: 0 };

  const currency = PaymentMethodCurrency[method] || 'VND';
  const vndAmount = Math.round(convertToVND(amount, method)); // Round to remove decimals

  // If already in VND, just show VND
  if (currency === 'VND') {
    return {
      display: `${vndAmount.toLocaleString('vi-VN')} đ`,
      vnd: vndAmount,
      original: null,
    };
  }

  // For foreign currency, show both original and VND
  return {
    display: `${vndAmount.toLocaleString('vi-VN')} đ`,
    vnd: vndAmount,
    original: {
      amount: amount,
      currency: currency,
      formatted: `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
    },
  };
};

export const getAppointmentStatusColor = (status) => {
  switch (status) {
    case AppointmentStatus.COMPLETED:
      return 'success';
    case AppointmentStatus.SCHEDULED:
      return 'blue';
    case AppointmentStatus.PENDING:
      return 'orange';
    case AppointmentStatus.RESCHEDULE:
      return 'gold';
    case AppointmentStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

export const getAppointmentStatusDisplay = (status) => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'Chờ phân công';
    case AppointmentStatus.RESCHEDULE:
      return 'Chờ duyệt đổi lịch';
    case AppointmentStatus.SCHEDULED:
      return 'Đã phân công';
    case AppointmentStatus.COMPLETED:
      return 'Hoàn thành';
    case AppointmentStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
};

export const getBookingStatusColor = (status) => {
  switch (status) {
    case BookingStatus.COMPLETED:
      return 'success';
    case BookingStatus.CONFIRMED:
      return 'blue';
    case BookingStatus.PENDING_PAYMENT:
      return 'orange';
    case BookingStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

export const getOrderStatusColor = (status) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.SHIPPED:
      return 'blue';
    case OrderStatus.PROCESSING:
      return 'processing';
    case OrderStatus.PENDING:
      return 'orange';
    case OrderStatus.CANCELLED:
      return 'red';
    default:
      return 'default';
  }
};

export const getPaymentMethodDisplay = (method) => {
  switch (method) {
    case PaymentMethod.METAMASK:
      return 'MetaMask';
    case PaymentMethod.PAYPAL:
      return 'PayPal';
    case PaymentMethod.BANK:
      return 'Chuyển khoản';
    case PaymentMethod.CASH:
      return 'Tiền mặt';
    default:
      return method;
  }
};

export const getGenderDisplay = (gender) => {
  switch (gender) {
    case Gender.MALE:
      return 'Nam';
    case Gender.FEMALE:
      return 'Nữ';
    default:
      return gender;
  }
};

export const getNewsCategoryDisplay = (category) => {
  const displays = {
    [NewsCategory.HEALTH_GENERAL]: 'Sức khỏe tổng quát',
    [NewsCategory.VACCINE_INFO]: 'Thông tin vaccine',
    [NewsCategory.DISEASE_PREVENTION]: 'Phòng ngừa bệnh tật',
    [NewsCategory.NUTRITION]: 'Dinh dưỡng',
    [NewsCategory.CHILDREN_HEALTH]: 'Sức khỏe trẻ em',
    [NewsCategory.WOMEN_HEALTH]: 'Sức khỏe phụ nữ',
    [NewsCategory.ELDERLY_CARE]: 'Chăm sóc người cao tuổi',
    [NewsCategory.MEDICAL_RESEARCH]: 'Nghiên cứu y khoa',
    [NewsCategory.HEALTH_TIPS]: 'Mẹo sức khỏe',
    [NewsCategory.COVID_19]: 'COVID-19',
    [NewsCategory.SEASONAL_DISEASES]: 'Bệnh theo mùa',
    [NewsCategory.VACCINATION_SCHEDULE]: 'Lịch tiêm chủng',
  };
  return displays[category] || category;
};
