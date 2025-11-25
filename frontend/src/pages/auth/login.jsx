import { FacebookOutlined, GoogleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callLoginWithPassword } from '../../config/api.auth';
import useAccountStore from '../../stores/useAccountStore';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUserLoginInfo } = useAccountStore();

  const handleSocialLogin = (provider) => {
    message.info(`${provider} login will be implemented soon!`);
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await callLoginWithPassword(values.email, values.password);

      if (response?.data) {
        const userData = response.data.user;
        const token = response.data.accessToken;

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Update Zustand store
        setUserLoginInfo(userData);

        message.success('Login successful!');

        // Navigate based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else if (
          userData.role === 'STAFF' ||
          userData.role === 'CASHIER' ||
          userData.role === 'DOCTOR'
        ) {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else {
        message.error(response?.error || 'Login failed!');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-xl">
        <div className="text-center mb-6">
          <Title level={2} className="mb-2">
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your account to continue</Text>
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
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Or continue with</Text>
        </Divider>

        <div className="space-y-3 mb-6">
          <Button
            icon={<GoogleOutlined />}
            className="w-full h-10 rounded-lg font-medium"
            onClick={() => handleSocialLogin('Google')}
          >
            Continue with Google
          </Button>

          <Button
            icon={<FacebookOutlined />}
            className="w-full h-10 rounded-lg font-medium"
            onClick={() => handleSocialLogin('Facebook')}
          >
            Continue with Facebook
          </Button>
        </div>

        <div className="text-center">
          <Text type="secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
