import { Navigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/useAccountStore';

/**
 * Protected route for authentication pages (login, register, etc.)
 * Redirects to home if user is already authenticated
 */
const ProtectedAuthRoute = ({ children }) => {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAuthRoute;
