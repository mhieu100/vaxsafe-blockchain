import { createBrowserRouter } from 'react-router-dom';

import LayoutClient from './components/client/layout.client';
import NotFound from './components/share/not.found';
import DashboardPage from './pages/admin/dashboard';
import RegisterPage from './pages/auth/register';
import LoginPage from './pages/auth/login';
import LayoutAdmin from './components/admin/layout.admin';
import ProtectedAdminRoute from './components/share/protected-route';
import ProtectedStaffRoute from './components/share/protected-route/staff-protected';
import ProtectedAuthRoute from './components/auth/ProtectedAuthRoute';
import VaccinePage from './pages/admin/vaccine';
import CenterPage from './pages/admin/center';
import UserPage from './pages/admin/user';
import AuthProfilePage from './pages/auth/profile';
import UserProfilePage from './pages/private/ProfilePage';
import ProtectedUserRoute from './components/share/protected-route/user-protected';
import PermissionPage from './pages/admin/permission';
import RolePage from './pages/admin/role';

// Staff pages
import LayoutStaff from './components/staff/layout.staff';
import StaffDashboard from './pages/staff/dashboard';
import MySchedulePage from './pages/staff/my-schedule';
import PendingAppointmentPage from './pages/staff/pending-appointment';
import CalendarView from './pages/staff/calendar-view';
import DoctorSchedule from './pages/staff/doctor-schedule';
import DoctorDashboard from './pages/staff/doctor-dashboard';
import NewsPage from './pages/admin/news';
import HomePage from './pages/client/Home';
import VaccineDetailPage from './pages/public/VaccineDetailPage';
import CartPage from './pages/public/CartPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import BookingPage from './pages/private/BookingPage';
import CheckoutPage from './pages/private/CheckoutPage';
import BlockchainPage from './pages/private/BlockchainPage';
import SuccessPage from './pages/private/SuccessPage';
import CancelPage from './pages/private/CancelPage';
import VaccineListPage from './pages/client/VaccineListPage';

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
        path: 'dashboard',
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
