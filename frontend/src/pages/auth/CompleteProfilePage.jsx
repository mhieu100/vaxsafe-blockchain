import {
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, message, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callCompleteProfile } from '@/services/auth.service';
import useAccountStore from '@/stores/useAccountStore';
import { birthdayValidation } from '@/utils/birthdayValidation';

const { Title, Text } = Typography;

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { setUserLoginInfo, isActive, isAuthenticated, user } = useAccountStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role && user.role !== 'PATIENT') {
      navigate('/');
      return;
    }

    if (isActive) {
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Header Section */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
          <SafetyCertificateFilled className="text-3xl" />
        </div>
        <Title
          level={1}
          className="!mb-3 !text-3xl lg:!text-4xl !font-bold text-slate-900 tracking-tight"
        >
          Complete Your Health Profile
        </Title>
        <Text className="text-slate-500 text-lg">
          We need a few more details to set up your secure{' '}
          <span className="font-semibold text-blue-600">Digital Medicine Card</span> and ensure
          accurate vaccination records.
        </Text>
      </div>

      <Card className="w-full max-w-4xl shadow-xl shadow-slate-200/60 border-0 rounded-3xl overflow-hidden">
        <div className="p-6 md:p-10">
          <Form
            form={form}
            name="complete-profile"
            onFinish={onSubmit}
            layout="vertical"
            requiredMark={false}
            size="large"
            className="space-y-8"
          >
            {/* Section 1: Personal Information */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserOutlined className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 m-0">Personal Information</h3>
                  <p className="text-slate-500 text-sm m-0">Basic identification details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="identityNumber"
                  label={
                    <span className="font-medium text-slate-700">
                      Identity No. / Personal ID <span className="text-red-500">*</span>
                    </span>
                  }
                  tooltip={{
                    title:
                      'For children under 14, please use the Personal ID Code found on the Birth Certificate.',
                    icon: <InfoCircleOutlined className="text-slate-400" />,
                  }}
                  rules={[
                    { required: true, message: 'Please input your identity number!' },
                    { pattern: /^[0-9]{9,12}$/, message: 'Please enter a valid identity number!' },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined className="text-slate-400 px-1" />}
                    placeholder="123456789"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="birthday"
                  label={
                    <span className="font-medium text-slate-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={birthdayValidation.getFormRules(true)}
                >
                  <DatePicker
                    className="w-full rounded-xl"
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                    disabledDate={birthdayValidation.disabledDate}
                    suffixIcon={<CalendarOutlined className="text-slate-400" />}
                  />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label={
                    <span className="font-medium text-slate-700">
                      Gender <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select your gender!' }]}
                >
                  <Select placeholder="Select gender" className="rounded-xl">
                    <Select.Option value="MALE">Male</Select.Option>
                    <Select.Option value="FEMALE">Female</Select.Option>
                    <Select.Option value="OTHER">Other</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <EnvironmentOutlined className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 m-0">Contact Details</h3>
                  <p className="text-slate-500 text-sm m-0">How we can reach you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="phone"
                  label={
                    <span className="font-medium text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Please input your phone number!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number!' },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400 px-1" />}
                    placeholder="0123456789"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label={
                    <span className="font-medium text-slate-700">
                      Address <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please input your address!' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-slate-400 px-1" />}
                    placeholder="Enter your full address"
                    className="rounded-xl"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Section 3: Medical Info */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <MedicineBoxOutlined className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 m-0">Medical Information</h3>
                  <p className="text-slate-500 text-sm m-0">Crucial for your vaccination safety</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item
                  name="bloodType"
                  label={
                    <span className="font-medium text-slate-700">
                      Blood Type <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select your blood type!' }]}
                >
                  <Select placeholder="Select type" className="rounded-xl">
                    <Select.Option value="A">A</Select.Option>
                    <Select.Option value="B">B</Select.Option>
                    <Select.Option value="AB">AB</Select.Option>
                    <Select.Option value="O">O</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="heightCm"
                  label={<span className="font-medium text-slate-700">Height (cm)</span>}
                >
                  <Input type="number" placeholder="e.g. 175" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="weightKg"
                  label={<span className="font-medium text-slate-700">Weight (kg)</span>}
                >
                  <Input type="number" placeholder="e.g. 70" className="rounded-xl" />
                </Form.Item>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-lg shadow-lg shadow-blue-500/30 border-0"
              >
                {isSubmitting
                  ? 'Creating Digital Card...'
                  : 'Complete Profile & Create Digital Card'}
              </Button>
              <p className="text-center text-slate-400 text-sm mt-4">
                By clicking the button, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
