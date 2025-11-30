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
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callCompleteProfile } from '@/services/auth.service';
import useAccountStore from '@/stores/useAccountStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userLoginInfo, setUserLoginInfo, isActive, isAuthenticated, user } = useAccountStore();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Only PATIENT role needs to complete profile
    if (user?.role && user.role !== 'PATIENT') {
      navigate('/');
      return;
    }

    // If profile is already complete, redirect to home
    if (isActive) {
      navigate('/');
    }
  }, [isAuthenticated, isActive, user, navigate]);

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
            Complete Your Health Profile
          </Title>
          <Text type="secondary">
            Help us provide personalized vaccination recommendations by completing your health
            information
          </Text>
        </div>

        <Form
          form={form}
          name="complete-profile"
          onFinish={onSubmit}
          layout="vertical"
          requiredMark={false}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number!' },
              ]}
            >
              <Input placeholder="0123456789" size="large" />
            </Form.Item>

            <Form.Item
              name="identityNumber"
              label="Identity Number (CMND/CCCD)"
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
            label="Address"
            rules={[{ required: true, message: 'Please input your address!' }]}
          >
            <Input placeholder="Enter your address" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="birthday"
              label="Date of Birth"
              rules={[{ required: true, message: 'Please select your date of birth!' }]}
            >
              <DatePicker
                className="w-full"
                size="large"
                format="DD/MM/YYYY"
                placeholder="Select date"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select placeholder="Select gender" size="large">
                <Select.Option value="MALE">Male</Select.Option>
                <Select.Option value="FEMALE">Female</Select.Option>
                <Select.Option value="OTHER">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="bloodType"
              label="Blood Type"
              rules={[{ required: true, message: 'Please select your blood type!' }]}
            >
              <Select placeholder="Select blood type" size="large">
                <Select.Option value="A">A</Select.Option>
                <Select.Option value="B">B</Select.Option>
                <Select.Option value="AB">AB</Select.Option>
                <Select.Option value="O">O</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="heightCm" label="Height (cm)">
              <InputNumber className="w-full" placeholder="170" min={50} max={250} size="large" />
            </Form.Item>

            <Form.Item name="weightKg" label="Weight (kg)">
              <InputNumber className="w-full" placeholder="70" min={20} max={300} size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="occupation" label="Occupation">
              <Input placeholder="Your occupation" size="large" />
            </Form.Item>

            <Form.Item name="insuranceNumber" label="Insurance Number">
              <Input placeholder="Insurance number" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="lifestyleNotes" label="Lifestyle Notes (optional)">
            <TextArea
              placeholder="Any lifestyle notes, allergies, or medical conditions we should know about"
              rows={3}
            />
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
              {isSubmitting ? 'Saving your profile...' : 'Complete Profile & Start Booking'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
