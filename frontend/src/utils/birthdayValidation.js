import dayjs from 'dayjs';

export const birthdayValidation = {
  MAX_AGE: 150,

  getMinBirthday: () => {
    return dayjs().subtract(birthdayValidation.MAX_AGE, 'year');
  },

  getMaxBirthday: () => {
    return dayjs();
  },

  isValidBirthday: (date) => {
    if (!date) return false;

    const birthday = dayjs(date);
    const today = dayjs();
    const minBirthday = birthdayValidation.getMinBirthday();

    if (!birthday.isValid()) return false;

    if (birthday.isAfter(today)) return false;

    if (birthday.isBefore(minBirthday)) return false;

    return true;
  },

  calculateAge: (birthday) => {
    if (!birthday) return 0;
    return dayjs().diff(dayjs(birthday), 'year');
  },

  disabledDate: (current) => {
    if (!current) return false;

    const today = dayjs().endOf('day');
    const minDate = birthdayValidation.getMinBirthday().startOf('day');

    return current.isAfter(today) || current.isBefore(minDate);
  },

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

  format: (birthday, format = 'DD/MM/YYYY') => {
    if (!birthday) return '--';
    return dayjs(birthday).format(format);
  },

  getAgeCategory: (birthday) => {
    if (!birthday) return 'ADULT';

    const age = birthdayValidation.calculateAge(birthday);

    if (age < 1) return 'NEWBORN';
    if (age < 18) return 'CHILD';
    return 'ADULT';
  },
};
