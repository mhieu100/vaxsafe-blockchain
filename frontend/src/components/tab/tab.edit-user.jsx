import { Button, Col, Form, Input, Row, Select, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import useAccountStore from '../../stores/useAccountStore';
import { updateAccount } from '../../config/api.auth';

const { Text, Paragraph } = Typography;

const TabEditUser = ({ editMode, setEditMode }) => {
  const [form] = Form.useForm();
  const { user, setUserLoginInfo } = useAccountStore();
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

      const payload = {
        user: {
          fullName: values.fullName,
        },
        patientProfile: {
          address: values.address,
          phone: values.phone,
          birthday: values.birthday,
          gender: values.gender,
          identityNumber: values.identityNumber,
          bloodType: values.bloodType,
          heightCm: values.heightCm,
          weightKg: values.weightKg,
          occupation: values.occupation,
          lifestyleNotes: values.lifestyleNotes,
          insuranceNumber: values.insuranceNumber,
        },
      };

      const response = await updateAccount(payload);

      if (!response?.data) {
        throw new Error('Update failed');
      }

      // Update store with new user data from backend
      setUserLoginInfo(response.data);

      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      message.error(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
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
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input disabled size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Phone" name="phone">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Date of Birth" name="birthday">
                <Input placeholder="YYYY-MM-DD" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select gender" size="large">
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Identity Number" name="identityNumber">
                <Input placeholder="CCCD/CMND" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Blood Type" name="bloodType">
                <Select placeholder="Select blood type" size="large">
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Height (cm)" name="heightCm">
                <Input type="number" placeholder="170" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Weight (kg)" name="weightKg">
                <Input type="number" placeholder="65" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={2} size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Occupation" name="occupation">
                <Input placeholder="Your occupation" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Insurance Number" name="insuranceNumber">
                <Input placeholder="Health insurance number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lifestyle Notes" name="lifestyleNotes">
            <Input.TextArea rows={3} placeholder="Notes about lifestyle, hobbies..." size="large" />
          </Form.Item>

          <div className="flex gap-2">
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading} size="large">
              Save Changes
            </Button>
            <Button onClick={() => setEditMode(false)} disabled={loading} size="large">
              Cancel
            </Button>
          </div>
        </Form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text type="secondary">Full Name</Text>
              <div className="text-base font-medium">{user?.fullName || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Email</Text>
              <div className="text-base font-medium">{user?.email || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Phone</Text>
              <div className="text-base font-medium">{user?.phone || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Date of Birth</Text>
              <div className="text-base font-medium">{user?.birthday || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Gender</Text>
              <div className="text-base font-medium">
                {user?.gender === 'MALE'
                  ? 'Male'
                  : user?.gender === 'FEMALE'
                    ? 'Female'
                    : user?.gender === 'OTHER'
                      ? 'Other'
                      : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">Identity Number</Text>
              <div className="text-base font-medium">{user?.identityNumber || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Blood Type</Text>
              <div className="text-base font-medium">{user?.bloodType || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Height</Text>
              <div className="text-base font-medium">
                {user?.heightCm ? `${user.heightCm} cm` : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">Weight</Text>
              <div className="text-base font-medium">
                {user?.weightKg ? `${user.weightKg} kg` : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">Occupation</Text>
              <div className="text-base font-medium">{user?.occupation || '--'}</div>
            </div>
            <div>
              <Text type="secondary">Insurance Number</Text>
              <div className="text-base font-medium">{user?.insuranceNumber || '--'}</div>
            </div>
          </div>

          <div>
            <Text type="secondary">Address</Text>
            <div className="text-base font-medium">{user?.address || '--'}</div>
          </div>

          <div>
            <Text type="secondary">Lifestyle Notes</Text>
            <Paragraph className="text-base whitespace-pre-line">
              {user?.lifestyleNotes || '--'}
            </Paragraph>
          </div>

          <div>
            <Button type="primary" onClick={() => setEditMode(true)} disabled={!user} size="large">
              Edit Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditUser;
