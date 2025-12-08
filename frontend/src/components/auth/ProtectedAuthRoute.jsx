import { Navigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/useAccountStore';

const ProtectedAuthRoute = ({ children }) => {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAuthRoute;
