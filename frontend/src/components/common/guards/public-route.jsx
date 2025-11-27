import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '@/components/common/feedback/Loading';
import { useAccountStore } from '@/stores/useAccountStore';

/**
 * Protected route for public/client pages
 * Redirects Admin to /admin and Staff to /staff
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
  const isLoading = useAccountStore((state) => state.isLoading);
  const user = useAccountStore((state) => state.user);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (user.role === 'ADMIN') {
        setRedirectPath('/admin');
      } else if (user.role === 'DOCTOR') {
        setRedirectPath('/staff/dashboard-doctor');
      } else if (user.role === 'CASHIER') {
        setRedirectPath('/staff/dashboard');
      }
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <Loading />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
