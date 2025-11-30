import { message, Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAccountStore from '../../stores/useAccountStore';

const OAuth2Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserLoginInfo } = useAccountStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const fullName = searchParams.get('fullName');
    const role = searchParams.get('role');
    const isProfileComplete = searchParams.get('isProfileComplete') === 'true';
    const userId = searchParams.get('userId');

    if (token && email) {
      // Store token in localStorage
      localStorage.setItem('token', token);

      // Update user info in store
      const userData = {
        id: userId,
        email,
        fullName,
        role,
        isActive: isProfileComplete,
      };

      setUserLoginInfo(userData);

      // Check if profile is complete - only PATIENT needs to complete profile
      if (!isProfileComplete && role === 'PATIENT') {
        message.info('Vui lòng hoàn thiện hồ sơ sức khỏe để bắt đầu đặt lịch tiêm');
        navigate('/complete-profile');
      } else {
        message.success('Đăng nhập thành công!');

        // Navigate based on role
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'CASHIER') {
          navigate('/staff/dashboard');
        } else if (role === 'DOCTOR') {
          navigate('/staff/dashboard-doctor');
        } else {
          navigate('/');
        }
      }
    } else {
      message.error('OAuth2 authentication failed!');
      navigate('/login');
    }
  }, [searchParams, navigate, setUserLoginInfo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
