import { createBrowserRouter } from 'react-router-dom';
import ProtectedAuthRoute from '@/components/auth/ProtectedAuthRoute';
import NotFound from '@/components/common/feedback/NotFound';
import ProtectedAdminRoute from '@/components/common/guards/protected-admin-route';
import ProtectedStaffRoute from '@/components/common/guards/protected-staff-route';
import ProtectedUserRoute from '@/components/common/guards/protected-user-route';
import PublicRoute from '@/components/common/guards/public-route';
import LayoutAdmin from '@/layouts/AdminLayout';
import LayoutClient from '@/layouts/ClientLayout';

import LayoutStaff from '@/layouts/StaffLayout';
import AiKnowledgePage from '@/pages/admin/ai-knowledge/AiKnowledgePage';
import AppointmentListPage from '@/pages/admin/appointment';
import AppointmentDetailPage from '@/pages/admin/appointment/AppointmentDetail';
import CashierPage from '@/pages/admin/cashier';
import CenterPage from '@/pages/admin/center';
import DashboardPage from '@/pages/admin/dashboard';
import DoctorPage from '@/pages/admin/doctor';
import MonitorPage from '@/pages/admin/monitor';
import NewsPage from '@/pages/admin/news';
import PatientPage from '@/pages/admin/patient';
import PermissionPage from '@/pages/admin/permission';
import AdminProfilePage from '@/pages/admin/profile';
import RolePage from '@/pages/admin/role';
import UserPage from '@/pages/admin/user';
import VaccinePage from '@/pages/admin/vaccine';
import CompleteProfilePage from '@/pages/auth/complete-profile';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import LoginPage from '@/pages/auth/login';
import OAuth2Callback from '@/pages/auth/oauth2-callback';
import RegisterPage from '@/pages/auth/register';
import ResetPasswordPage from '@/pages/auth/reset-password';
import AboutPage from '@/pages/client/about';
import AppointmentSchedulePage from '@/pages/client/appointment-schedule';
import BookingPage from '@/pages/client/booking';
import CancelPage from '@/pages/client/cancel';
import CartPage from '@/pages/client/cart';
import CheckoutPage from '@/pages/client/checkout';
import ContactPage from '@/pages/client/contact';
import FamilyMemberPage from '@/pages/client/family-member';
import HomePage from '@/pages/client/home';
import ClientNewsPage from '@/pages/client/news';
import ClientNewsDetailPage from '@/pages/client/news/detail';
import UserProfilePage from '@/pages/client/profile';
import SuccessPage from '@/pages/client/success';
import VaccineDetailPage from '@/pages/client/vaccine-detail';
import VaccineListPage from '@/pages/client/vaccine-list';
import VerifyLandingPage from '@/pages/public/verify/VerifyLandingPage';
import VerifyResultPage from '@/pages/public/verify/VerifyResultPage';
import CalendarView from '@/pages/staff/calendar-view';
import StaffDashboard from '@/pages/staff/dashboard';
import DoctorDashboard from '@/pages/staff/doctor-dashboard';
import DoctorSchedule from '@/pages/staff/doctor-schedule';
import MySchedulePage from '@/pages/staff/my-schedule';
import PendingAppointmentPage from '@/pages/staff/pending-appointment';
import StaffProfilePage from '@/pages/staff/profile';
import WalkInBookingPage from '@/pages/staff/walk-in-booking';

const router = createBrowserRouter([
  {
    path: '/verify',
    element: <VerifyLandingPage />,
  },
  {
    path: '/verify/:id',
    element: <VerifyResultPage />,
  },
  {
    path: '/',
    element: (
      <PublicRoute>
        <LayoutClient />
      </PublicRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'vaccine', element: <VaccineListPage /> },
      { path: 'vaccine/:id', element: <VaccineDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'news', element: <ClientNewsPage /> },
      { path: 'news/:slug', element: <ClientNewsDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },

      {
        path: 'profile',
        element: (
          <ProtectedUserRoute>
            <UserProfilePage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'booking',
        element: (
          <ProtectedUserRoute>
            <BookingPage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedUserRoute>
            <CheckoutPage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'success',
        element: (
          <ProtectedUserRoute>
            <SuccessPage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'family-member',
        element: (
          <ProtectedUserRoute>
            <FamilyMemberPage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'cancel',
        element: (
          <ProtectedUserRoute>
            <CancelPage />
          </ProtectedUserRoute>
        ),
      },
      {
        path: 'appointments',
        element: (
          <ProtectedUserRoute>
            <AppointmentSchedulePage />
          </ProtectedUserRoute>
        ),
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <ProtectedAdminRoute>
        <LayoutAdmin />
      </ProtectedAdminRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'monitor',
        element: <MonitorPage />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'appointments',
        element: <AppointmentListPage />,
      },
      {
        path: 'appointments/:id',
        element: <AppointmentDetailPage />,
      },
      {
        path: 'vaccines',
        element: <VaccinePage />,
      },

      {
        path: 'users',
        element: <UserPage />,
      },
      {
        path: 'patients',
        element: <PatientPage />,
      },
      {
        path: 'cashiers',
        element: <CashierPage />,
      },
      {
        path: 'doctors',
        element: <DoctorPage />,
      },
      {
        path: 'centers',
        element: <CenterPage />,
      },
      {
        path: 'permissions',
        element: <PermissionPage />,
      },
      {
        path: 'roles',
        element: <RolePage />,
      },
      {
        path: 'ai-knowledge',
        element: <AiKnowledgePage />,
      },
      {
        path: 'profile',
        element: <AdminProfilePage />,
      },
    ],
  },

  {
    path: '/staff',
    element: (
      <ProtectedStaffRoute>
        <LayoutStaff />
      </ProtectedStaffRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        path: 'dashboard',
        element: <StaffDashboard />,
      },
      {
        path: 'dashboard-doctor',
        element: <DoctorDashboard />,
      },

      {
        path: 'pending-appointments',
        element: <PendingAppointmentPage />,
      },
      {
        path: 'walk-in-booking',
        element: <WalkInBookingPage />,
      },
      {
        path: 'calendar-view',
        element: <CalendarView />,
      },
      {
        path: 'doctor-schedule',
        element: <DoctorSchedule />,
      },
      {
        path: 'my-schedule',
        element: <MySchedulePage />,
      },
      {
        path: 'profile',
        element: <StaffProfilePage />,
      },
    ],
  },

  {
    path: '/login',
    element: (
      <ProtectedAuthRoute>
        <LoginPage />
      </ProtectedAuthRoute>
    ),
  },

  {
    path: '/register',
    element: (
      <ProtectedAuthRoute>
        <RegisterPage />
      </ProtectedAuthRoute>
    ),
  },

  {
    path: '/forgot-password',
    element: (
      <ProtectedAuthRoute>
        <ForgotPasswordPage />
      </ProtectedAuthRoute>
    ),
  },

  {
    path: '/reset-password',
    element: (
      <ProtectedAuthRoute>
        <ResetPasswordPage />
      </ProtectedAuthRoute>
    ),
  },

  {
    path: '/complete-profile',
    element: <CompleteProfilePage />,
  },

  {
    path: '/oauth2/callback',
    element: <OAuth2Callback />,
  },
]);

export default router;
