import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files from src folder
import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';

const LANGUAGE_KEY = 'lang';

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    vi: { common: viCommon },
  },
  lng: typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) || 'vi' : 'vi',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

// Helper function to change language
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
};

export default i18n;
