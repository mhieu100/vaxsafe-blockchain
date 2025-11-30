import {
  ArrowLeftOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { callLogin } from '@/services/auth.service';
import { changeLanguage } from '../../i18n';
import useAccountStore from '../../stores/useAccountStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const { Title, Text } = Typography;

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUserLoginInfo } = useAccountStore();

  const languageItems = [
    {
      key: 'vi',
      label: 'VI',
      onClick: () => changeLanguage('vi'),
    },
    {
      key: 'en',
      label: 'EN',
      onClick: () => changeLanguage('en'),
    },
  ];

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await callLogin(values.email, values.password);

      if (response?.data) {
        const userData = response.data.user;
        const token = response.data.accessToken;

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Update Zustand store
        setUserLoginInfo(userData);

        // Check if user needs to complete profile - only for PATIENT role
        if (userData.role === 'PATIENT' && (!userData.phone || !userData.address)) {
          message.info('Vui lòng hoàn thiện hồ sơ sức khỏe để bắt đầu đặt lịch tiêm');
          setTimeout(() => navigate('/complete-profile'), 100);
          return;
        }

        message.success(t('auth.login.loginSuccess'));

        // Navigate based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else if (userData.role === 'CASHIER') {
          navigate('/staff/dashboard');
        } else if (userData.role === 'DOCTOR') {
          navigate('/staff/dashboard-doctor');
        } else {
          navigate('/');
        }
      } else {
        message.error(response?.error || t('auth.login.loginFailed'));
      }
    } catch (error) {
      message.error(error?.message || t('auth.login.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white z-10 relative">
        {/* Back to Home Button */}
        <div className="absolute top-8 left-8">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftOutlined className="mr-2" />
            <span className="font-medium">{t('auth.login.backToHome')}</span>
          </Link>
        </div>

        {/* Language Switcher */}
        <div className="absolute top-8 right-8">
          <Dropdown menu={{ items: languageItems }} placement="bottomRight">
            <Button icon={<GlobalOutlined />} className="flex items-center">
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </Button>
          </Dropdown>
        </div>

        <div className="w-full max-w-md mx-auto mt-12 lg:mt-0">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              VS
            </div>
          </div>

          <div className="mb-8">
            <Title level={2} className="!mb-2 !text-3xl !font-bold text-gray-900">
              {t('auth.login.title')}
            </Title>
            <Text className="text-gray-500 text-base">{t('auth.login.subtitle')}</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onSubmit}
            layout="vertical"
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              name="email"
              label={t('auth.login.email')}
              rules={[
                { required: true, message: t('auth.login.emailRequired') },
                { type: 'email', message: t('auth.login.emailInvalid') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder={t('auth.login.emailPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.login.password')}
              rules={[
                { required: true, message: t('auth.login.passwordRequired') },
                { min: 6, message: t('auth.login.passwordRequired') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium text-lg"
              >
                {isSubmitting ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.login.orSignInWith')}</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              className="w-full h-11 flex items-center justify-center font-medium text-base border-gray-300 hover:border-blue-500 hover:text-blue-500"
            >
              {t('auth.login.orSignInWith')} Google
            </Button>
          </div>

          <div className="text-center">
            <Text className="text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                {t('auth.login.signUp')}
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Image Area */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src="/login-bg.jpg"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>
  );
};

export default Login;
