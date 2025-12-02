import dayjs from 'dayjs';

/**
 * Birthday validation utilities
 */
export const birthdayValidation = {
  /**
   * Maximum age allowed (150 years)
   */
  MAX_AGE: 150,

  /**
   * Get the minimum allowed birthday (150 years ago from today)
   */
  getMinBirthday: () => {
    return dayjs().subtract(birthdayValidation.MAX_AGE, 'year');
  },

  /**
   * Get the maximum allowed birthday (today - for newborns)
   */
  getMaxBirthday: () => {
    return dayjs();
  },

  /**
   * Validate if a date is a valid birthday
   * @param {dayjs.Dayjs | Date | string} date - Date to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidBirthday: (date) => {
    if (!date) return false;

    const birthday = dayjs(date);
    const today = dayjs();
    const minBirthday = birthdayValidation.getMinBirthday();

    // Check if date is valid
    if (!birthday.isValid()) return false;

    // Check if date is not in the future
    if (birthday.isAfter(today)) return false;

    // Check if date is not more than MAX_AGE years ago
    if (birthday.isBefore(minBirthday)) return false;

    return true;
  },

  /**
   * Calculate age from birthday
   * @param {dayjs.Dayjs | Date | string} birthday - Birthday date
   * @returns {number} - Age in years
   */
  calculateAge: (birthday) => {
    if (!birthday) return 0;
    return dayjs().diff(dayjs(birthday), 'year');
  },

  /**
   * Ant Design DatePicker disabledDate function
   * Disables dates in the future and dates more than 150 years ago
   * @param {dayjs.Dayjs} current - Current date being checked
   * @returns {boolean} - True if date should be disabled
   */
  disabledDate: (current) => {
    if (!current) return false;

    const today = dayjs().endOf('day');
    const minDate = birthdayValidation.getMinBirthday().startOf('day');

    // Disable future dates and dates more than 150 years ago
    return current.isAfter(today) || current.isBefore(minDate);
  },

  /**
   * Form validation rule for birthday
   * @param {boolean} required - Whether birthday is required
   * @returns {Array} - Ant Design form rules
   */
  getFormRules: (required = true) => {
    const rules = [];

    if (required) {
      rules.push({
        required: true,
        message: 'Please select your date of birth!',
      });
    }

    rules.push({
      validator: (_, value) => {
        if (!value && !required) {
          return Promise.resolve();
        }

        if (!value && required) {
          return Promise.reject(new Error('Birthday is required'));
        }

        if (!birthdayValidation.isValidBirthday(value)) {
          const minDate = birthdayValidation.getMinBirthday().format('DD/MM/YYYY');
          return Promise.reject(new Error(`Birthday must be between ${minDate} and today`));
        }

        return Promise.resolve();
      },
    });

    return rules;
  },

  /**
   * Format birthday for display
   * @param {dayjs.Dayjs | Date | string} birthday - Birthday date
   * @param {string} format - Format string (default: DD/MM/YYYY)
   * @returns {string} - Formatted date
   */
  format: (birthday, format = 'DD/MM/YYYY') => {
    if (!birthday) return '--';
    return dayjs(birthday).format(format);
  },

  /**
   * Get age category
   * @param {dayjs.Dayjs | Date | string} birthday - Birthday date
   * @returns {string} - Age category: NEWBORN, CHILD, or ADULT
   */
  getAgeCategory: (birthday) => {
    if (!birthday) return 'ADULT';

    const age = birthdayValidation.calculateAge(birthday);

    if (age < 1) return 'NEWBORN'; // Less than 1 year
    if (age < 18) return 'CHILD'; // Less than 18 years
    return 'ADULT'; // 18 years and above
  },
};
