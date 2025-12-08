import { ArrowLeftOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Divider, Form, Input, Typography } from 'antd';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEmail(values.email);
      setEmailSent(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-xl border-0">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleOutlined className="text-2xl text-green-600" />
              </div>
              <Title level={2} className="mb-2">
                {t('auth.checkEmail')}
              </Title>
              <Text type="secondary" className="text-base">
                {t('auth.resetLinkSent')}
              </Text>
              <Text strong className="block text-blue-600 mt-1">
                {email}
              </Text>
            </div>

            <Alert
              message={t('auth.emailSentSuccess')}
              description={t('auth.emailSentDesc')}
              type="success"
              showIcon
              className="mb-6"
            />

            <div className="space-y-4">
              <Text type="secondary" className="block text-center text-sm">
                {t('auth.didntReceive')}
              </Text>

              <Button type="link" onClick={handleResendEmail} loading={loading} className="w-full">
                {t('auth.resendEmail')}
              </Button>

              <Divider />

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/login')}
                className="w-full"
              >
                {t('auth.backToLogin')}
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
              <MailOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="mb-2">
              {t('auth.forgotPassword')}
            </Title>
            <Text type="secondary" className="text-base">
              {t('auth.forgotPasswordDesc')}
            </Text>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              name="email"
              label={t('auth.emailAddress')}
              rules={[
                { required: true, message: t('auth.emailRequired') },
                { type: 'email', message: t('auth.emailInvalid') },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder={t('auth.emailPlaceholder')}
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base font-medium rounded-lg"
              >
                {t('auth.sendResetLink')}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center space-y-4">
            <Text type="secondary" className="text-sm">
              {t('auth.rememberPassword')}
            </Text>

            <Button
              type="link"
              onClick={() => navigate('/login')}
              icon={<ArrowLeftOutlined />}
              className="p-0"
            >
              {t('auth.backToLogin')}
            </Button>
          </div>

          <Divider />

          <div className="text-center">
            <Text type="secondary" className="text-xs">
              {t('auth.needHelp')}{' '}
              <Link href="/support" className="text-blue-600">
                {t('auth.supportTeam')}
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
