import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChatBot from '@/components/common/chatbot/ChatBot';
import Loading from '@/components/common/feedback/Loading';
import Footer from './client/ClientFooter';
import Navbar from './client/ClientHeader';

const LayoutClient = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
      {location.pathname !== '/success' && location.pathname !== '/profile' && <Footer />}
      <ChatBot />
    </>
  );
};

export default LayoutClient;
