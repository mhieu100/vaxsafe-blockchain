import { Button, Col, Form, Input, message, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { updateProfile } from '@/services/profile.service';
import { useAccountStore } from '@/stores/useAccountStore';

const { Text, Paragraph } = Typography;

const TabEditUser = ({ editMode, setEditMode }) => {
  const [form] = Form.useForm();
  const { user, updateUserInfo } = useAccountStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        gender: user.gender,
        address: user.address,
        identityNumber: user.identityNumber,
        bloodType: user.bloodType,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        occupation: user.occupation,
        lifestyleNotes: user.lifestyleNotes,
        insuranceNumber: user.insuranceNumber,
      });
    }
  }, [editMode, user, form]);

  const handleSaveProfile = async (values) => {
    if (!user) return;

    try {
      setLoading(true);

      // Call API to update user profile based on role
      // Assuming 'patient' role for now as this component seems to be used for patients
      // Ideally, we should get the role from the user object or props
      const role = user.role || 'patient';

      // Filter out empty values to avoid sending nulls where not appropriate
      // But for update, we usually want to send all fields from the form

      // Note: birthday and identityNumber are disabled in form but might be in values if not handled correctly
      // The backend ignores them anyway, but good to be clean

      await updateProfile(role, values);

      // Update local store
      if (updateUserInfo) {
        updateUserInfo(values);
      }

      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Update profile error:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 animate-fade-in">
      {editMode ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          initialValues={
            user
              ? {
                  fullName: user.fullName,
                  email: user.email,
                  phone: user.phone,
                  birthday: user.birthday,
                  gender: user.gender,
                  address: user.address,
                  identityNumber: user.identityNumber,
                  bloodType: user.bloodType,
                  heightCm: user.heightCm,
                  weightKg: user.weightKg,
                  occupation: user.occupation,
                  lifestyleNotes: user.lifestyleNotes,
                  insuranceNumber: user.insuranceNumber,
                }
              : undefined
          }
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                <Input disabled className="rounded-lg bg-slate-50 text-slate-500" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label="Phone" name="phone">
                <Input className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Date of Birth"
                name="birthday"
                tooltip="Cannot be changed - used for blockchain identity"
              >
                <Input
                  disabled
                  placeholder="YYYY-MM-DD"
                  className="rounded-lg bg-slate-50 text-slate-500"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select gender" className="rounded-lg">
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Identity Number"
                name="identityNumber"
                tooltip="Cannot be changed - used for blockchain identity"
              >
                <Input
                  disabled
                  placeholder="ID Card / Passport"
                  className="rounded-lg bg-slate-50 text-slate-500"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item label="Blood Type" name="bloodType">
                <Select placeholder="Select type" className="rounded-lg">
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Height (cm)" name="heightCm">
                <Input type="number" placeholder="170" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Weight (kg)" name="weightKg">
                <Input type="number" placeholder="65" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={2} className="rounded-lg" />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label="Occupation" name="occupation">
                <Input placeholder="Occupation" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Insurance Number" name="insuranceNumber">
                <Input placeholder="Health Insurance Number" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lifestyle Notes" name="lifestyleNotes">
            <Input.TextArea
              rows={3}
              placeholder="Notes about lifestyle, hobbies, etc."
              className="rounded-lg"
            />
          </Form.Item>

          <div className="flex gap-3 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-10 shadow-lg shadow-blue-500/30"
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setEditMode(false)}
              disabled={loading}
              className="rounded-xl px-6 h-10 hover:bg-slate-100"
            >
              Cancel
            </Button>
          </div>
        </Form>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Full Name
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.fullName || '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Email
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">{user?.email || '--'}</div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Phone
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">{user?.phone || '--'}</div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Date of Birth
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.birthday || '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Gender
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.gender === 'MALE'
                  ? 'Male'
                  : user?.gender === 'FEMALE'
                    ? 'Female'
                    : user?.gender === 'OTHER'
                      ? 'Other'
                      : '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Identity Number
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.identityNumber || '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Blood Type
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.bloodType || '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Height
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.heightCm ? `${user.heightCm} cm` : '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Weight
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.weightKg ? `${user.weightKg} kg` : '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Occupation
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.occupation || '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                Insurance Number
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.insuranceNumber || '--'}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 pb-2">
            <Text
              type="secondary"
              className="text-xs uppercase tracking-wider font-semibold text-slate-400"
            >
              Address
            </Text>
            <div className="text-lg font-medium text-slate-800 mt-1">{user?.address || '--'}</div>
          </div>

          <div className="border-b border-slate-100 pb-2">
            <Text
              type="secondary"
              className="text-xs uppercase tracking-wider font-semibold text-slate-400"
            >
              Lifestyle Notes
            </Text>
            <Paragraph className="text-base whitespace-pre-line text-slate-800 mt-1">
              {user?.lifestyleNotes || '--'}
            </Paragraph>
          </div>

          <div className="pt-4">
            <Button
              type="primary"
              onClick={() => setEditMode(true)}
              disabled={!user}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-10 shadow-lg shadow-blue-500/30"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditUser;
