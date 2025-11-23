import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';

import useAccountStore from './stores/useAccountStore';
import router from './routes';

const App = () => {
  const { isAuthenticated, fetchAccount } = useAccountStore();
  
  useEffect(() => {
    fetchAccount();
  }, [fetchAccount, isAuthenticated]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
