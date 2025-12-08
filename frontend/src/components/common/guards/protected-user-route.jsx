import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '@/components/common/feedback/Loading';
import { useAccountStore } from '@/stores/useAccountStore';
import NotPermitted from './not-permitted';

const ProtectedUserRoute = (props) => {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
  const isLoading = useAccountStore((state) => state.isLoading);
  const user = useAccountStore((state) => state.user);
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

  if (isAuthenticated && user?.role && ['ADMIN', 'DOCTOR', 'CASHIER'].includes(user.role)) {
    return <NotPermitted />;
  }

  return (
    <>
      {isLoading === true ? (
        <Loading />
      ) : isAuthenticated === true ? (
        props.children
      ) : (
        <Navigate to="/login" replace />
      )}
    </>
  );
};

export default ProtectedUserRoute;
