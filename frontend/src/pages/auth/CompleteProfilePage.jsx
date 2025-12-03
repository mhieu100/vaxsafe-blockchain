import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callCompleteProfile } from '@/services/auth.service';
import useAccountStore from '@/stores/useAccountStore';
import { birthdayValidation } from '@/utils/birthdayValidation';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { setUserLoginInfo, isActive, isAuthenticated, user } = useAccountStore();

  useEffect(() => {
    // Wait a bit for state to settle after navigation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    console.log('CompleteProfilePage useEffect:', {
      isAuthenticated,
      isActive,
      user: user?.email,
      role: user?.role,
    });

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('Not authenticated, redirect to login');
      navigate('/login');
      return;
    }

    // Only PATIENT role needs to complete profile
    if (user?.role && user.role !== 'PATIENT') {
      console.log('Not PATIENT role, redirect to home');
      navigate('/');
      return;
    }

    // If profile is already complete, redirect to home
    if (isActive) {
      console.log('Profile already active, redirect to home');
      navigate('/');
    }
  }, [isReady, isAuthenticated, isActive, user, navigate]);

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      const payload = {
        patientProfile: {
          phone: values.phone,
          address: values.address,
          birthday: values.birthday.format('YYYY-MM-DD'),
          gender: values.gender,
          identityNumber: values.identityNumber,
          bloodType: values.bloodType,
          heightCm: values.heightCm || null,
          weightKg: values.weightKg || null,
          occupation: values.occupation || null,
          lifestyleNotes: values.lifestyleNotes || null,
          insuranceNumber: values.insuranceNumber || null,
          consentForAIAnalysis: values.consentForAIAnalysis || false,
        },
      };

      const response = await callCompleteProfile(payload);

      if (response?.data) {
        setUserLoginInfo(response.data);
        message.success('Health profile completed! You can now book your vaccinations.');
        navigate('/');
      } else {
        message.error(response?.error || 'Failed to complete profile');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred while completing profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <Card className="w-full max-w-2xl shadow-2xl border-0 rounded-xl">
        <div className="text-center mb-6">
          <Title level={2} className="mb-2">
            Create Your Digital Medicine Card
          </Title>
          <Text type="secondary">
            Please provide your information to generate your unique blockchain-based Digital
            Medicine Card.
            <br />
            Fields marked with <span className="text-red-500">*</span> are required.
          </Text>
        </div>

        <Form
          form={form}
          name="complete-profile"
          onFinish={onSubmit}
          layout="vertical"
          requiredMark={false} // We will manually add asterisks
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label={
                <span>
                  Phone Number <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number!' },
              ]}
            >
              <Input placeholder="0123456789" size="large" />
            </Form.Item>

            <Form.Item
              name="identityNumber"
              label={
                <span>
                  Identity No. / Personal ID <span className="text-red-500">*</span>
                </span>
              }
              tooltip="For children under 14, please use the Personal ID Code found on the Birth Certificate."
              rules={[
                { required: true, message: 'Please input your identity number!' },
                { pattern: /^[0-9]{9,12}$/, message: 'Please enter a valid identity number!' },
              ]}
            >
              <Input placeholder="123456789" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={
              <span>
                Address <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please input your address!' }]}
          >
            <Input placeholder="Enter your address" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="birthday"
              label={
                <span>
                  Date of Birth <span className="text-red-500">*</span>
                </span>
              }
              rules={birthdayValidation.getFormRules(true)}
            >
              <DatePicker
                className="w-full"
                size="large"
                format="DD/MM/YYYY"
                placeholder="Select date"
                disabledDate={birthdayValidation.disabledDate}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label={
                <span>
                  Gender <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select placeholder="Select gender" size="large">
                <Select.Option value="MALE">Male</Select.Option>
                <Select.Option value="FEMALE">Female</Select.Option>
                <Select.Option value="OTHER">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="bloodType"
            label={
              <span>
                Blood Type <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please select your blood type!' }]}
          >
            <Select placeholder="Select blood type" size="large">
              <Select.Option value="A">A</Select.Option>
              <Select.Option value="B">B</Select.Option>
              <Select.Option value="AB">AB</Select.Option>
              <Select.Option value="O">O</Select.Option>
            </Select>
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
              {isSubmitting ? 'Creating Digital Card...' : 'Create Digital Medicine Card'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
