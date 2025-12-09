import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAdminVaccines from './locales/en/admin/vaccines.json';
import enClientAppointments from './locales/en/client/appointments.json';
import enClientBooking from './locales/en/client/booking.json';
import enClientDashboard from './locales/en/client/dashboard.json';
import enClientFamily from './locales/en/client/family.json';
import enClientHome from './locales/en/client/home.json';
import enClientLayout from './locales/en/client/layout.json';
import enClientProfile from './locales/en/client/profile.json';
import enClientRecords from './locales/en/client/records.json';
import enClientSettings from './locales/en/client/settings.json';
import enCommonAuth from './locales/en/common/auth.json';
import enCommonBlockchain from './locales/en/common/blockchain.json';
import enCommonCart from './locales/en/common/cart.json';
import enCommonErrors from './locales/en/common/errors.json';
import enCommonFooter from './locales/en/common/footer.json';
import enCommonHeader from './locales/en/common/header.json';
import enCommonHero from './locales/en/common/hero.json';
import enCommonRoles from './locales/en/common/roles.json';
import enCommonService from './locales/en/common/service.json';
import enCommonUser from './locales/en/common/user.json';
import enCommonVaccinationHistory from './locales/en/common/vaccinationHistory.json';
import enCommonVaccine from './locales/en/common/vaccine.json';
import enStaffAppointments from './locales/en/staff/appointments.json';
import enStaffCalendar from './locales/en/staff/calendar.json';
import enStaffCommon from './locales/en/staff/common.json';
import enStaffDashboard from './locales/en/staff/dashboard.json';
import enStaffDoctorSchedule from './locales/en/staff/doctorSchedule.json';

import viAdminCenters from './locales/vi/admin/centers.json';
import viAdminCommon from './locales/vi/admin/common.json';
import viAdminDashboard from './locales/vi/admin/dashboard.json';
import viAdminNews from './locales/vi/admin/news.json';
import viAdminPermissions from './locales/vi/admin/permissions.json';
import viAdminRoles from './locales/vi/admin/roles.json';
import viAdminUsers from './locales/vi/admin/users.json';
import viAdminVaccines from './locales/vi/admin/vaccines.json';
import viClientAppointments from './locales/vi/client/appointments.json';
import viClientBooking from './locales/vi/client/booking.json';
import viClientDashboard from './locales/vi/client/dashboard.json';
import viClientFamily from './locales/vi/client/family.json';
import viClientHome from './locales/vi/client/home.json';
import viClientLayout from './locales/vi/client/layout.json';
import viClientProfile from './locales/vi/client/profile.json';
import viClientRecords from './locales/vi/client/records.json';
import viClientSettings from './locales/vi/client/settings.json';
import viCommonAuth from './locales/vi/common/auth.json';
import viCommonBlockchain from './locales/vi/common/blockchain.json';
import viCommonCart from './locales/vi/common/cart.json';
import viCommonErrors from './locales/vi/common/errors.json';
import viCommonFooter from './locales/vi/common/footer.json';
import viCommonHeader from './locales/vi/common/header.json';
import viCommonHero from './locales/vi/common/hero.json';
import viCommonRoles from './locales/vi/common/roles.json';
import viCommonService from './locales/vi/common/service.json';
import viCommonUser from './locales/vi/common/user.json';
import viCommonVaccinationHistory from './locales/vi/common/vaccinationHistory.json';
import viCommonVaccine from './locales/vi/common/vaccine.json';
import viStaffAppointments from './locales/vi/staff/appointments.json';
import viStaffCalendar from './locales/vi/staff/calendar.json';
import viStaffCommon from './locales/vi/staff/common.json';
import viStaffDashboard from './locales/vi/staff/dashboard.json';
import viStaffDoctorSchedule from './locales/vi/staff/doctorSchedule.json';

const LANGUAGE_KEY = 'lang';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: {
        auth: enCommonAuth,
        blockchain: enCommonBlockchain,
        cart: enCommonCart,
        errors: enCommonErrors,
        footer: enCommonFooter,
        header: enCommonHeader,
        hero: enCommonHero,
        roles: enCommonRoles,
        service: enCommonService,
        user: enCommonUser,
        vaccinationHistory: enCommonVaccinationHistory,
        vaccine: enCommonVaccine,
      },
      admin: {
        centers: enAdminCenters,
        common: enAdminCommon,
        dashboard: enAdminDashboard,
        news: enAdminNews,
        permissions: enAdminPermissions,
        roles: enAdminRoles,
        users: enAdminUsers,
        vaccines: enAdminVaccines,
      },
      staff: {
        appointments: enStaffAppointments,
        calendar: enStaffCalendar,
        common: enStaffCommon,
        dashboard: enStaffDashboard,
        doctorSchedule: enStaffDoctorSchedule,
      },
      client: {
        ...enClientLayout,
        ...enClientBooking,
        ...enClientRecords,

        profile: enClientProfile,
        dashboard: enClientDashboard,
        family: enClientFamily,
        appointments: enClientAppointments,
        settings: enClientSettings,
        home: enClientHome,
      },
    },
    vi: {
      common: {
        auth: viCommonAuth,
        blockchain: viCommonBlockchain,
        cart: viCommonCart,
        errors: viCommonErrors,
        footer: viCommonFooter,
        header: viCommonHeader,
        hero: viCommonHero,
        roles: viCommonRoles,
        service: viCommonService,
        user: viCommonUser,
        vaccinationHistory: viCommonVaccinationHistory,
        vaccine: viCommonVaccine,
      },
      admin: {
        centers: viAdminCenters,
        common: viAdminCommon,
        dashboard: viAdminDashboard,
        news: viAdminNews,
        permissions: viAdminPermissions,
        roles: viAdminRoles,
        users: viAdminUsers,
        vaccines: viAdminVaccines,
      },
      staff: {
        appointments: viStaffAppointments,
        calendar: viStaffCalendar,
        common: viStaffCommon,
        dashboard: viStaffDashboard,
        doctorSchedule: viStaffDoctorSchedule,
      },
      client: {
        ...viClientLayout,
        ...viClientBooking,
        ...viClientRecords,

        profile: viClientProfile,
        dashboard: viClientDashboard,
        family: viClientFamily,
        appointments: viClientAppointments,
        settings: viClientSettings,
        home: viClientHome,
      },
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
