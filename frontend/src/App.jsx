import { App as AntApp } from 'antd';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import useAccountStore from './stores/useAccountStore';

const App = () => {
  const { fetchAccount } = useAccountStore();

  useEffect(() => {
    const path = window.location.pathname;
    console.log('App.jsx useEffect, path:', path);

    if (path === '/oauth2/callback' || path === '/complete-profile') {
      console.log('Skipping fetchAccount for', path);
      return;
    }

    console.log('Calling fetchAccount');
    fetchAccount();
  }, [fetchAccount]);

  return (
    <AntApp>
      <RouterProvider router={router} />
    </AntApp>
  );
};

export default App;
