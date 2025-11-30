import { App as AntApp } from 'antd';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import useAccountStore from './stores/useAccountStore';

const App = () => {
  const { fetchAccount } = useAccountStore();

  useEffect(() => {
    // Skip fetchAccount if user is on OAuth callback or complete-profile page
    const path = window.location.pathname;
    if (path === '/oauth2/callback' || path === '/complete-profile') {
      return;
    }

    fetchAccount();
  }, [fetchAccount]);

  return (
    <AntApp>
      <RouterProvider router={router} />
    </AntApp>
  );
};

export default App;
