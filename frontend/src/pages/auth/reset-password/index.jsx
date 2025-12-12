import {
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, notification, Progress, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { callResetPassword } from '../../../services/auth.service';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useTranslation('common');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ... (keep helper functions)

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
    if (strength < 30) return t('auth.weak');
    if (strength < 60) return t('auth.fair');
    if (strength < 80) return t('auth.good');
    return t('auth.strong');
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error(t('auth.invalidToken') || 'Invalid or missing token');
      }
      await callResetPassword({ token, newPassword: values.password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      notification.error({
        message: t('auth.error'),
        description: error?.message || t('auth.somethingWentWrong'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-xl border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleOutlined className="text-2xl text-green-600" />
              </div>
              <Title level={2} className="mb-2 text-green-600">
                {t('auth.resetSuccess')}
              </Title>
              <Text type="secondary" className="text-base block mb-4">
                {t('auth.resetSuccessDesc')}
              </Text>

              <Alert
                message={t('auth.success')}
                description={t('auth.canLoginNow')}
                type="success"
                showIcon
                className="mb-6"
              />

              <Button
                type="primary"
                onClick={() => navigate('/login')}
                className="w-full h-12 text-base font-medium rounded-lg"
              >
                {t('auth.goToLogin')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="rounded-2xl shadow-xl border-0">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="mb-2">
              {t('auth.resetPassword')}
            </Title>
            <Text type="secondary" className="text-base">
              {t('auth.createNewPassword')}
            </Text>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              name="password"
              label={t('auth.newPassword')}
              rules={[
                { required: true, message: t('auth.newPasswordRequired') },
                { min: 8, message: t('auth.passwordMinLength') },
                {
                  validator: (_, value) => {
                    if (!value || calculatePasswordStrength(value) >= 60) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.passwordTooWeak')));
                  },
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t('auth.newPasswordPlaceholder')}
                size="large"
                className="rounded-lg"
                onChange={handlePasswordChange}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            {passwordStrength > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">{t('auth.passwordStrength')}</Text>
                  <Text
                    className="text-sm font-medium"
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
                />
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              dependencies={['password']}
              rules={[
                { required: true, message: t('auth.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.passwordsNotMatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                size="large"
                className="rounded-lg"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <div className="mb-6">
              <Alert
                message={t('auth.passwordRequirements')}
                description={
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• {t('auth.requirement1')}</li>
                    <li>• {t('auth.requirement2')}</li>
                    <li>• {t('auth.requirement3')}</li>
                    <li>• {t('auth.requirement4')}</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </div>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base font-medium rounded-lg"
              >
                {t('auth.resetPasswordButton')}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Text type="secondary" className="text-sm">
              {t('auth.rememberPassword')}{' '}
              <Button type="link" onClick={() => navigate('/login')} className="p-0">
                {t('auth.backToLogin')}
              </Button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
