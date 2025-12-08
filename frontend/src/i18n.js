import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enAdmin from './locales/en/admin.json';
import enClient from './locales/en/client.json';

import enCommon from './locales/en/common.json';
import enStaff from './locales/en/staff.json';
import viAdmin from './locales/vi/admin.json';
import viClient from './locales/vi/client.json';
import viCommon from './locales/vi/common.json';
import viStaff from './locales/vi/staff.json';

const LANGUAGE_KEY = 'lang';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      admin: enAdmin,
      staff: enStaff,
      client: enClient,
    },
    vi: {
      common: viCommon,
      admin: viAdmin,
      staff: viStaff,
      client: viClient,
    },
  },
  lng: typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) || 'vi' : 'vi',
  fallbackLng: 'en',
  ns: ['common', 'admin', 'staff', 'client'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
};

export default i18n;
