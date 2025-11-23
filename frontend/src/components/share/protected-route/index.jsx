import { Navigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Loading from '../loading';
import { useAccountStore } from '../../../stores/useAccountStore';

import NotPermitted from './not-permitted';

const RoleBaseRoute = (props) => {
  const user = useAccountStore((state) => state.user);

  if (
    user.role === 'ADMIN') {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedRoute = (props) => {
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
    return <Navigate to='/login' replace />;
  }

  return (
    <>
      {isLoading === true ? (
        <Loading />
      ) : (
        <>
          {isAuthenticated === true ? (
            <>
              <RoleBaseRoute>{props.children}</RoleBaseRoute>
            </>
          ) : (
            <Navigate to='/login' replace />
          )}
        </>
      )}
    </>
  );
};

RoleBaseRoute.propTypes = {
  children: PropTypes.node,
};
ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
export default ProtectedRoute;
