import { createBrowserRouter } from 'react-router-dom';
import LayoutAdmin from '@/components/admin/layout.admin';
import ProtectedAuthRoute from '@/components/auth/ProtectedAuthRoute';
import LayoutClient from '@/components/client/layout.client';
import NotFound from '@/components/common/feedback/NotFound';
import ProtectedAdminRoute from '@/components/common/guards/protected-admin-route';
import ProtectedStaffRoute from '@/components/common/guards/protected-staff-route';
import ProtectedUserRoute from '@/components/common/guards/protected-user-route';
import PublicRoute from '@/components/common/guards/public-route';
// Staff pages
import LayoutStaff from '@/components/staff/layout.staff';
import CashierPage from '@/pages/admin/cashier';
import CenterPage from '@/pages/admin/center';
import DashboardPage from '@/pages/admin/dashboard';
import DoctorPage from '@/pages/admin/doctor';
import NewsPage from '@/pages/admin/news';
import PatientPage from '@/pages/admin/patient';
import PermissionPage from '@/pages/admin/permission';
import AdminProfilePage from '@/pages/admin/profile';
import RolePage from '@/pages/admin/role';
import UserPage from '@/pages/admin/user';
import VaccinePage from '@/pages/admin/vaccine';
import CompleteProfilePage from '@/pages/auth/CompleteProfilePage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import LoginPage from '@/pages/auth/login';
import OAuth2Callback from '@/pages/auth/OAuth2Callback';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import RegisterPage from '@/pages/auth/register';
import AboutPage from '@/pages/client/about';
import BlockchainPage from '@/pages/client/BlockchainPage';
import BookingPage from '@/pages/client/booking';
import CancelPage from '@/pages/client/CancelPage';
import CheckoutPage from '@/pages/client/CheckoutPage';
import CartPage from '@/pages/client/cart';
import HomePage from '@/pages/client/home';
import ClientNewsPage from '@/pages/client/news';
import ClientNewsDetailPage from '@/pages/client/news/detail';
import UserProfilePage from '@/pages/client/profile';
import SuccessPage from '@/pages/client/SuccessPage';
import VaccineDetailPage from '@/pages/client/vaccine-detail';
import VaccineListPage from '@/pages/client/vaccine-list';
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
        path: 'blockchain',
        element: (
          <ProtectedUserRoute>
            <BlockchainPage />
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
        path: 'cancel',
        element: (
          <ProtectedUserRoute>
            <CancelPage />
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
        path: 'news',
        element: <NewsPage />,
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
        path: 'profile',
        element: <AdminProfilePage />,
      },
    ],
  },

  // Staff route - only accessible by DOCTOR and CASHIER roles
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
