import {
  ArrowLeftOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { changeLanguage } from '../../i18n';
import { callRegister } from '../../services/auth.service';
import useAccountStore from '../../stores/useAccountStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const { Title, Text } = Typography;

const Register = () => {
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

  const handleGoogleRegister = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const handleRegister = async (values) => {
    try {
      setIsSubmitting(true);

      const payload = {
        user: {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        },
        patientProfile: {},
      };

      const response = await callRegister(payload);

      if (response?.data) {
        const userData = response.data.user;
        const token = response.data.accessToken;

        localStorage.setItem('token', token);
        setUserLoginInfo(userData);

        message.success(t('auth.register.registerSuccess'));

        setTimeout(() => {
          navigate('/complete-profile', { replace: true });
        }, 100);
      } else {
        message.error(response?.error || t('auth.register.registerFailed'));
      }
    } catch (error) {
      message.error(error?.message || t('auth.register.registerFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 bg-white z-10 relative shadow-2xl shadow-slate-200/50 py-12">
        {/* Header Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ArrowLeftOutlined className="text-sm" />
            </div>
            <span className="font-medium">{t('auth.register.backToHome')}</span>
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

        <div className="w-full max-w-[440px] mx-auto mt-16 lg:mt-0">
          {/* Logo & Title */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
              <SafetyCertificateFilled className="text-2xl" />
            </div>
            <Title level={1} className="!mb-2 !text-3xl !font-bold text-slate-900 tracking-tight">
              {t('auth.register.title')}
            </Title>
            <Text className="text-slate-500 text-lg block">{t('auth.register.subtitle')}</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            requiredMark={false}
            size="large"
            className="space-y-4"
          >
            <Form.Item
              name="fullName"
              label={
                <span className="font-medium text-slate-700">{t('auth.register.fullName')}</span>
              }
              rules={[
                { required: true, message: t('auth.register.fullNameRequired') },
                { min: 2, message: t('auth.register.fullNameMinLength') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.fullNamePlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-medium text-slate-700">{t('auth.register.email')}</span>}
              rules={[
                { required: true, message: t('auth.register.emailRequired') },
                { type: 'email', message: t('auth.register.emailInvalid') },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.emailPlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="font-medium text-slate-700">{t('auth.register.password')}</span>
              }
              rules={[
                { required: true, message: t('auth.register.passwordRequired') },
                { min: 8, message: t('auth.register.passwordMinLength') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.passwordPlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <span className="font-medium text-slate-700">
                  {t('auth.register.confirmPassword')}
                </span>
              }
              dependencies={['password']}
              rules={[
                { required: true, message: t('auth.register.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.register.passwordsNotMatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                className="rounded-xl py-2.5 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item className="!mb-2 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg shadow-lg shadow-blue-500/30 border-0"
              >
                {t('auth.register.registerButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">
                {t('auth.register.orSignUpWith')}
              </span>
            </div>
          </div>

          <Button
            icon={<GoogleOutlined className="text-lg" />}
            onClick={handleGoogleRegister}
            className="w-full h-12 flex items-center justify-center gap-2 font-medium text-slate-700 border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            Sign up with Google
          </Button>

          <div className="mt-8 text-center">
            <Text className="text-slate-500">
              {t('auth.register.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline ml-1"
              >
                {t('auth.register.signIn')}
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Image Area */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-blue-900/90 mix-blend-multiply z-10" />
        <img
          src="/login-bg.jpg"
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="max-w-lg space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
              <UserOutlined className="text-4xl text-indigo-300" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Join the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-200">
                Digital Healthcare
              </span>
            </h2>
            <p className="text-lg text-indigo-100/80 leading-relaxed">
              Create your account today to access secure vaccination records, smart scheduling, and
              family health management.
            </p>

            {/* Features List */}
            <div className="mt-12 text-left space-y-4 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 text-xs">
                  ✓
                </div>
                <span className="text-indigo-50">Secure Blockchain Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 text-xs">
                  ✓
                </div>
                <span className="text-indigo-50">Instant Digital Passport</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 text-xs">
                  ✓
                </div>
                <span className="text-indigo-50">Family Member Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
