import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import useAccountStore from './stores/useAccountStore';

const App = () => {
  const { fetchAccount } = useAccountStore();

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return <RouterProvider router={router} />;
};

export default App;
