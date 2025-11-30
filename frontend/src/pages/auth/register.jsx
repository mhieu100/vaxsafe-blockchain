import {
  ArrowLeftOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { changeLanguage } from '../../i18n';
import { callRegister } from '../../services/auth.service';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const { Title, Text } = Typography;

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleGoogleRegister = () => {
    // Redirect to backend OAuth2 endpoint
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
        patientProfile: {}, // Empty profile for initial registration
      };

      const response = await callRegister(payload);

      if (response?.data) {
        message.success(t('auth.register.registerSuccess'));
        navigate('/login');
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
    <div className="min-h-screen flex w-full">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white z-10 relative py-12">
        {/* Back to Home Button */}
        <div className="absolute top-8 left-8">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftOutlined className="mr-2" />
            <span className="font-medium">{t('auth.register.backToHome')}</span>
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
              {t('auth.register.title')}
            </Title>
            <Text className="text-gray-500 text-base">{t('auth.register.subtitle')}</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              name="fullName"
              label={t('auth.register.fullName')}
              rules={[
                { required: true, message: t('auth.register.fullNameRequired') },
                { min: 2, message: t('auth.register.fullNameMinLength') },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('auth.register.fullNamePlaceholder')}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('auth.register.email')}
              rules={[
                { required: true, message: t('auth.register.emailRequired') },
                { type: 'email', message: t('auth.register.emailInvalid') },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder={t('auth.register.emailPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.register.password')}
              rules={[
                { required: true, message: t('auth.register.passwordRequired') },
                {
                  min: 8,
                  message: t('auth.register.passwordMinLength'),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.register.passwordPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('auth.register.confirmPassword')}
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
                prefix={<LockOutlined />}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium text-lg"
              >
                {isSubmitting ? t('auth.register.registering') : t('auth.register.registerButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.register.orSignUpWith')}</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleRegister}
              className="w-full h-11 flex items-center justify-center font-medium text-base border-gray-300 hover:border-blue-500 hover:text-blue-500"
            >
              {t('auth.register.orSignUpWith')} Google
            </Button>
          </div>

          <div className="text-center">
            <Text className="text-gray-600">
              {t('auth.register.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                {t('auth.register.signIn')}
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Image Area */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden sticky top-0 h-screen">
        <img
          src="/login-bg.jpg"
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>
  );
};

export default Register;
