import { createBrowserRouter } from 'react-router-dom';
import LayoutAdmin from './components/admin/layout.admin';
import ProtectedAuthRoute from './components/auth/ProtectedAuthRoute';
import LayoutClient from './components/client/layout.client';
import { NotFound } from './components/common/feedback';
import {
  ProtectedRoute as ProtectedAdminRoute,
  StaffProtected as ProtectedStaffRoute,
  UserProtected as ProtectedUserRoute,
} from './components/common/guards';
// Staff pages
import LayoutStaff from './components/staff/layout.staff';
import CenterPage from './pages/admin/center';
import DashboardPage from './pages/admin/dashboard';
import NewsPage from './pages/admin/news';
import PermissionPage from './pages/admin/permission';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import VaccinePage from './pages/admin/vaccine';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/login';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import RegisterPage from './pages/auth/register';
import BlockchainPage from './pages/client/BlockchainPage';
import BookingPage from './pages/client/booking';
import CancelPage from './pages/client/CancelPage';
import CheckoutPage from './pages/client/CheckoutPage';
import CartPage from './pages/client/cart';
import HomePage from './pages/client/home';
import UserProfilePage from './pages/client/profile';
import SuccessPage from './pages/client/SuccessPage';
import VaccineDetailPage from './pages/client/vaccine-detail';
import VaccineListPage from './pages/client/vaccine-list';
import CalendarView from './pages/staff/calendar-view';
import StaffDashboard from './pages/staff/dashboard';
import DoctorDashboard from './pages/staff/doctor-dashboard';
import DoctorSchedule from './pages/staff/doctor-schedule';
import MySchedulePage from './pages/staff/my-schedule';
import PendingAppointmentPage from './pages/staff/pending-appointment';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutClient />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'vaccine', element: <VaccineListPage /> },
      { path: 'vaccine/:id', element: <VaccineDetailPage /> },
      { path: 'cart', element: <CartPage /> },

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
]);

export default router;
