import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/useAccountStore';
import { Loading } from '../feedback';
import NotPermitted from './not-permitted';

// Staff role-based route protection (only DOCTOR and CASHIER can access)
const StaffRoleRoute = (props) => {
  const user = useAccountStore((state) => state.user);

  // Only DOCTOR and CASHIER can access staff routes
  if (user?.role === 'DOCTOR' || user?.role === 'CASHIER') {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedStaffRoute = (props) => {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
  const isLoading = useAccountStore((state) => state.isLoading);

  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setRedirectToLogin(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {isLoading === true ? (
        <Loading />
      ) : isAuthenticated === true ? (
        <StaffRoleRoute>{props.children}</StaffRoleRoute>
      ) : (
        <Navigate to="/login" replace />
      )}
    </>
  );
};

StaffRoleRoute.propTypes = {
  children: PropTypes.node,
};
ProtectedStaffRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedStaffRoute;
