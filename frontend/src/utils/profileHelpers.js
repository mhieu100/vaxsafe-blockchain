import { USER_ROLES } from '@/constants/profile';

export const getProfileEndpoint = (role) => {
  return `/profile/${role?.toLowerCase() || ''}`;
};

export const formatBloodType = (bloodType) => {
  if (!bloodType) return 'N/A';
  return bloodType.replace('_', '');
};

export const formatGender = (gender) => {
  if (!gender) return 'N/A';
  return gender.charAt(0) + gender.slice(1).toLowerCase();
};

export const hasRole = (userRole, requiredRole) => {
  return userRole?.toUpperCase() === requiredRole?.toUpperCase();
};

export const getRoleDisplayName = (role) => {
  const roleMap = {
    [USER_ROLES.PATIENT]: 'Patient',
    [USER_ROLES.DOCTOR]: 'Doctor',
    [USER_ROLES.CASHIER]: 'Cashier',
    [USER_ROLES.ADMIN]: 'Administrator',
  };
  return roleMap[role?.toUpperCase()] || role;
};

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

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return 'N/A';
  return time;
};

export const isValidPhone = (phone) => {
  return /^[0-9]{9,11}$/.test(phone);
};

export const isValidIdentityNumber = (identityNumber) => {
  return /^[0-9]{9,12}$/.test(identityNumber);
};

export const getInitials = (fullName) => {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const formatProfileForAPI = (formData, role) => {
  const { id, email, role: userRole, ...rest } = formData;

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

export const isProfileComplete = (profile, role) => {
  const requiredFields = ['fullName', 'email'];

  if (role === USER_ROLES.PATIENT) {
    requiredFields.push('phone', 'birthday', 'identityNumber');
  }

  return requiredFields.every((field) => profile?.[field]);
};

export const getProfileCompletionPercentage = (profile, role) => {
  if (!profile) return 0;

  const fields = ['fullName', 'email', 'phone', 'gender', 'birthday', 'address'];

  if (role === USER_ROLES.PATIENT) {
    fields.push('identityNumber', 'bloodType', 'heightCm', 'weightKg');
  }

  const filledFields = fields.filter((field) => profile[field]).length;
  return Math.round((filledFields / fields.length) * 100);
};
