/**
 * Profile related constants and enums
 */

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const BLOOD_TYPE_OPTIONS = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  CASHIER: 'CASHIER',
  ADMIN: 'ADMIN',
};

export const PROFILE_QUERY_KEYS = {
  PATIENT: ['profile', 'patient'],
  DOCTOR: ['profile', 'doctor'],
  CASHIER: ['profile', 'cashier'],
  ADMIN: ['profile', 'admin'],
};

export const VALIDATION_PATTERNS = {
  PHONE: /^[0-9]{9,11}$/,
  IDENTITY_NUMBER: /^[0-9]{9,12}$/,
};

export const VALIDATION_MESSAGES = {
  PHONE: 'Phone must be 9-11 digits',
  IDENTITY_NUMBER: 'Identity number must be 9-12 digits',
  REQUIRED: 'This field is required',
  POSITIVE_NUMBER: 'Must be a positive number',
  PAST_DATE: 'Date must be in the past',
};
