import { USER_ROLES } from '@/constants/profile';

/**
 * Get profile endpoint based on user role
 * @param {string} role - User role
 * @returns {string} Profile endpoint path
 */
export const getProfileEndpoint = (role) => {
  return `/profile/${role?.toLowerCase() || ''}`;
};

/**
 * Format blood type for display
 * @param {string} bloodType - Blood type enum value
 * @returns {string} Formatted blood type
 */
export const formatBloodType = (bloodType) => {
  if (!bloodType) return 'N/A';
  return bloodType.replace('_', '');
};

/**
 * Format gender for display
 * @param {string} gender - Gender enum value
 * @returns {string} Formatted gender
 */
export const formatGender = (gender) => {
  if (!gender) return 'N/A';
  return gender.charAt(0) + gender.slice(1).toLowerCase();
};

/**
 * Check if user has specific role
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required role to check
 * @returns {boolean}
 */
export const hasRole = (userRole, requiredRole) => {
  return userRole?.toUpperCase() === requiredRole?.toUpperCase();
};

/**
 * Get role display name
 * @param {string} role - User role
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const roleMap = {
    [USER_ROLES.PATIENT]: 'Patient',
    [USER_ROLES.DOCTOR]: 'Doctor',
    [USER_ROLES.CASHIER]: 'Cashier',
    [USER_ROLES.ADMIN]: 'Administrator',
  };
  return roleMap[role?.toUpperCase()] || role;
};

/**
 * Check if field is editable by role
 * @param {string} fieldName - Field name
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isFieldEditable = (fieldName, role) => {
  const restrictedFields = {
    email: [],
    licenseNumber: ['ADMIN'],
    employeeCode: ['ADMIN'],
    centerName: ['ADMIN'],
    centerAddress: ['ADMIN'],
  };

  const allowedRoles = restrictedFields[fieldName];
  if (!allowedRoles) return true;

  return allowedRoles.includes(role?.toUpperCase());
};

/**
 * Format date for display
 * @param {string} date - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time (shift times)
 * @param {string} time - Time string (HH:mm)
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';
  return time;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return /^[0-9]{9,11}$/.test(phone);
};

/**
 * Validate identity number
 * @param {string} identityNumber - Identity number
 * @returns {boolean}
 */
export const isValidIdentityNumber = (identityNumber) => {
  return /^[0-9]{9,12}$/.test(identityNumber);
};

/**
 * Get initials from full name
 * @param {string} fullName - User's full name
 * @returns {string} Initials
 */
export const getInitials = (fullName) => {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Calculate age from birthday
 * @param {string} birthday - Birthday ISO string
 * @returns {number} Age in years
 */
export const calculateAge = (birthday) => {
  if (!birthday) return 0;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} heightCm - Height in centimeters
 * @param {number} weightKg - Weight in kilograms
 * @returns {number|null} BMI value
 */
export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
};

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Format profile data for API
 * @param {Object} formData - Form data from react-hook-form
 * @param {string} role - User role
 * @returns {Object} Formatted data for API
 */
export const formatProfileForAPI = (formData, role) => {
  // Remove read-only fields
  // eslint-disable-next-line no-unused-vars
  const { id, email, role: userRole, ...rest } = formData;

  // Remove role-specific read-only fields
  if (role === USER_ROLES.DOCTOR) {
    delete rest.licenseNumber;
    delete rest.centerId;
    delete rest.centerName;
    delete rest.centerAddress;
  } else if (role === USER_ROLES.CASHIER) {
    delete rest.employeeCode;
    delete rest.centerId;
    delete rest.centerName;
    delete rest.centerAddress;
  }

  return rest;
};

/**
 * Check if profile is complete
 * @param {Object} profile - Profile data
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isProfileComplete = (profile, role) => {
  const requiredFields = ['fullName', 'email'];

  if (role === USER_ROLES.PATIENT) {
    requiredFields.push('phone', 'birthday', 'identityNumber');
  }

  return requiredFields.every((field) => profile?.[field]);
};

/**
 * Get profile completion percentage
 * @param {Object} profile - Profile data
 * @param {string} role - User role
 * @returns {number} Completion percentage (0-100)
 */
export const getProfileCompletionPercentage = (profile, role) => {
  if (!profile) return 0;

  const fields = ['fullName', 'email', 'phone', 'gender', 'birthday', 'address'];

  if (role === USER_ROLES.PATIENT) {
    fields.push('identityNumber', 'bloodType', 'heightCm', 'weightKg');
  }

  const filledFields = fields.filter((field) => profile[field]).length;
  return Math.round((filledFields / fields.length) * 100);
};
