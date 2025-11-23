import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

import { fetchAccount } from './redux/slice/accountSlide';
import router from './routes';

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  useEffect(() => {
    dispatch(fetchAccount());
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
