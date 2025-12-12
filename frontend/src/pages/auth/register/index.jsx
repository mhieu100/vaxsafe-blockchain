import {
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Input, message, Progress, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from '@/services/auth.service';
import useAccountStore from '@/stores/useAccountStore';
import { changeLanguage } from '../../../i18n';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const { Title, Text } = Typography;

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return '#ff4d4f';
    if (strength < 60) return '#faad14';
    if (strength < 80) return '#1890ff';
    return '#52c41a';
  };

  const getStrengthText = (strength) => {
    if (strength < 30) return t('common:auth.weak');
    if (strength < 60) return t('common:auth.fair');
    if (strength < 80) return t('common:auth.good');
    return t('common:auth.strong');
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleGoogleRegister = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const handleRegister = async (values) => {
    try {
      setIsSubmitting(true);

      const payload = {
        avatar: null,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
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
      {}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 bg-white z-10 relative shadow-2xl shadow-slate-200/50 py-6">
        {}
        <div className="absolute top-6 left-8 right-8 flex justify-between items-center">
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

        <div className="w-full max-w-[440px] mx-auto mt-8 lg:mt-0">
          {}
          <div className="mb-4 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-3 shadow-lg shadow-blue-500/30">
              <SafetyCertificateFilled className="text-xl" />
            </div>
            <Title level={1} className="!mb-1 !text-2xl !font-bold text-slate-900 tracking-tight">
              {t('auth.register.title')}
            </Title>
            <Text className="text-slate-500 text-base block">{t('auth.register.subtitle')}</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            requiredMark={false}
            size="large"
            className="space-y-2"
          >
            <Form.Item
              name="fullName"
              label={
                <span className="font-medium text-slate-700 text-sm">
                  {t('auth.register.fullName')}
                </span>
              }
              className="mb-2"
              rules={[
                { required: true, message: t('auth.register.fullNameRequired') },
                { min: 2, message: t('auth.register.fullNameMinLength') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.fullNamePlaceholder')}
                className="rounded-xl py-2 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="font-medium text-slate-700 text-sm">
                  {t('auth.register.email')}
                </span>
              }
              className="mb-2"
              rules={[
                { required: true, message: t('auth.register.emailRequired') },
                { type: 'email', message: t('auth.register.emailInvalid') },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.emailPlaceholder')}
                className="rounded-xl py-2 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="font-medium text-slate-700 text-sm">
                  {t('auth.register.password')}
                </span>
              }
              className="mb-2"
              rules={[
                { required: true, message: t('auth.register.passwordRequired') },
                { min: 8, message: t('auth.register.passwordMinLength') },
                {
                  validator: (_, value) => {
                    if (!value || calculatePasswordStrength(value) >= 60) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('common:auth.passwordTooWeak')));
                  },
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 px-1" />}
                placeholder={t('auth.register.passwordPlaceholder')}
                className="rounded-xl py-2 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
                onChange={handlePasswordChange}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            {passwordStrength > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-xs text-gray-500">{t('common:auth.passwordStrength')}</Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getStrengthColor(passwordStrength) }}
                  >
                    {getStrengthText(passwordStrength)}
                  </Text>
                </div>
                <Progress
                  percent={passwordStrength}
                  strokeColor={getStrengthColor(passwordStrength)}
                  showInfo={false}
                  size="small"
                  className="mb-0"
                />
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              label={
                <span className="font-medium text-slate-700 text-sm">
                  {t('auth.register.confirmPassword')}
                </span>
              }
              className="mb-2"
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
                className="rounded-xl py-2 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item className="!mb-2 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-base shadow-lg shadow-blue-500/30 border-0"
              >
                {t('auth.register.registerButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-medium">
                {t('auth.register.orSignUpWith')}
              </span>
            </div>
          </div>

          <Button
            icon={<GoogleOutlined className="text-base" />}
            onClick={handleGoogleRegister}
            className="w-full h-10 flex items-center justify-center gap-2 font-medium text-slate-700 border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm"
          >
            Sign up with Google
          </Button>

          <div className="mt-4 text-center">
            <Text className="text-slate-500 text-sm">
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

      {}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-blue-900/90 mix-blend-multiply z-10" />
        <img
          src="/login-bg.jpg"
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />

        {}
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

            {}
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
