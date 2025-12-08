import {
  ArrowLeftOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { callLogin } from '@/services/auth.service';
import useAccountStore from '@/stores/useAccountStore';
import { changeLanguage } from '../../../i18n';

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
      label: 'Tiếng Việt',
      onClick: () => changeLanguage('vi'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => changeLanguage('en'),
    },
  ];

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await callLogin(values.email, values.password);

      if (response?.data) {
        const userData = response.data.user;
        const token = response.data.accessToken;

        localStorage.setItem('token', token);
        setUserLoginInfo(userData);

        if (userData.role === 'PATIENT' && (!userData.phone || !userData.address)) {
          message.info('Please complete your health profile to continue.');
          setTimeout(() => navigate('/complete-profile'), 100);
          return;
        }

        message.success(t('auth.login.loginSuccess'));

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
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 bg-white z-10 relative shadow-2xl shadow-slate-200/50">
        {/* Header Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ArrowLeftOutlined className="text-sm" />
            </div>
            <span className="font-medium">{t('auth.login.backToHome')}</span>
          </Link>

          <Dropdown menu={{ items: languageItems }} placement="bottomRight" arrow>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              className="flex items-center text-slate-600 hover:bg-slate-50"
            >
              {i18n.language === 'vi' ? 'VN' : 'EN'}
            </Button>
          </Dropdown>
        </div>

        <div className="w-full max-w-[440px] mx-auto mt-20 lg:mt-0">
          {/* Logo & Title */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
              <SafetyCertificateFilled className="text-3xl" />
            </div>
            <Title
              level={1}
              className="!mb-3 !text-3xl lg:!text-4xl !font-bold text-slate-900 tracking-tight"
            >
              {t('auth.login.title')}
            </Title>
            <Text className="text-slate-500 text-lg block">{t('auth.login.subtitle')}</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onSubmit}
            layout="vertical"
            requiredMark={false}
            size="large"
            className="space-y-5"
          >
            <Form.Item
              name="email"
              label={<span className="font-medium text-slate-700">{t('auth.login.email')}</span>}
              rules={[
                { required: true, message: t('auth.login.emailRequired') },
                { type: 'email', message: t('auth.login.emailInvalid') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.login.emailPlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-medium text-slate-700">{t('auth.login.password')}</span>}
              rules={[
                { required: true, message: t('auth.login.passwordRequired') },
                { min: 6, message: t('auth.login.passwordRequired') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.login.passwordPlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-2">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                {/* Checkbox can be added here if needed */}
              </Form.Item>
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <Form.Item className="!mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg shadow-lg shadow-blue-500/30 border-0"
              >
                {t('auth.login.loginButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">
                {t('auth.login.orSignInWith')}
              </span>
            </div>
          </div>

          <Button
            icon={<GoogleOutlined className="text-lg" />}
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-2 font-medium text-slate-700 border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            Continue with Google
          </Button>

          <div className="mt-8 text-center">
            <Text className="text-slate-500">
              {t('auth.login.noAccount')}{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline ml-1"
              >
                {t('auth.login.signUp')}
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Image Area */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-900/90 mix-blend-multiply z-10" />
        <img
          src="/login-bg.jpg"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="max-w-lg space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
              <SafetyCertificateFilled className="text-4xl text-blue-300" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-teal-200">
                Secured on Blockchain
              </span>
            </h2>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Access your digital vaccination records, manage appointments, and protect your
              family's health history with military-grade security.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-sm text-blue-200 mt-1">Vaccines Administered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50k+</div>
                <div className="text-sm text-blue-200 mt-1">Verified Patients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-blue-200 mt-1">Secure Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
