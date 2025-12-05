import { Button, Col, DatePicker, Form, Input, message, Row, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePatientProfile } from '@/services/profile.service';
import useAccountStore from '@/stores/useAccountStore';
import { birthdayValidation } from '@/utils/birthdayValidation';

const { Text, Paragraph } = Typography;

const TabEditUser = ({ editMode, setEditMode }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['client', 'common']);
  const { user, setUserLoginInfo } = useAccountStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday ? dayjs(user.birthday) : null,
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

      // New payload format for profile API
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        gender: values.gender,
        address: values.address,
        bloodType: values.bloodType,
        heightCm: values.heightCm ? parseFloat(values.heightCm) : null,
        weightKg: values.weightKg ? parseFloat(values.weightKg) : null,
        occupation: values.occupation,
        lifestyleNotes: values.lifestyleNotes,
        insuranceNumber: values.insuranceNumber,
        consentForAIAnalysis: user.consentForAIAnalysis || false,
      };

      const response = await updatePatientProfile(payload);

      if (!response?.data) {
        throw new Error('Update failed');
      }

      // Update store with new user data from backend
      setUserLoginInfo(response.data);

      message.success(t('client:profile.updateSuccess'));
      setEditMode(false);
    } catch (error) {
      console.error('Update profile error:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to update profile');
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
                label={t('client:profile.fullName')}
                name="fullName"
                rules={[{ required: true, message: t('client:profile.enterFullName') }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('client:profile.email')}
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input disabled size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.phone')} name="phone">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('client:profile.dateOfBirth')}
                name="birthday"
                rules={birthdayValidation.getFormRules(false)}
              >
                <DatePicker
                  className="w-full"
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder={t('client:booking.selectDate')}
                  disabledDate={birthdayValidation.disabledDate}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.gender')} name="gender">
                <Select placeholder={t('client:profile.selectGender')} size="large">
                  <Select.Option value="MALE">{t('client:profile.male')}</Select.Option>
                  <Select.Option value="FEMALE">{t('client:profile.female')}</Select.Option>
                  <Select.Option value="OTHER">{t('client:profile.other')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.identityNumber')} name="identityNumber">
                <Input placeholder="CCCD/CMND" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label={t('client:profile.bloodType')} name="bloodType">
                <Select placeholder={t('client:profile.selectBloodType')} size="large">
                  <Select.Option value="A_POSITIVE">A+</Select.Option>
                  <Select.Option value="A_NEGATIVE">A-</Select.Option>
                  <Select.Option value="B_POSITIVE">B+</Select.Option>
                  <Select.Option value="B_NEGATIVE">B-</Select.Option>
                  <Select.Option value="AB_POSITIVE">AB+</Select.Option>
                  <Select.Option value="AB_NEGATIVE">AB-</Select.Option>
                  <Select.Option value="O_POSITIVE">O+</Select.Option>
                  <Select.Option value="O_NEGATIVE">O-</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={`${t('client:profile.height')} (cm)`} name="heightCm">
                <Input type="number" placeholder="170" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={`${t('client:profile.weight')} (kg)`} name="weightKg">
                <Input type="number" placeholder="65" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('client:profile.address')} name="address">
            <Input.TextArea rows={2} size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.occupation')} name="occupation">
                <Input placeholder={t('client:profile.enterOccupation')} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.insuranceNumber')} name="insuranceNumber">
                <Input placeholder={t('client:profile.enterInsuranceNumber')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('client:profile.lifestyleNotes')} name="lifestyleNotes">
            <Input.TextArea
              rows={3}
              placeholder={t('client:profile.enterLifestyleNotes')}
              size="large"
            />
          </Form.Item>

          <div className="flex gap-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              size="large"
            >
              {t('client:profile.saveChanges')}
            </Button>
            <Button onClick={() => setEditMode(false)} disabled={loading} size="large">
              {t('client:profile.cancel')}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text type="secondary">{t('client:profile.fullName')}</Text>
              <div className="text-base font-medium">{user?.fullName || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.email')}</Text>
              <div className="text-base font-medium">{user?.email || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.phone')}</Text>
              <div className="text-base font-medium">{user?.phone || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.dateOfBirth')}</Text>
              <div className="text-base font-medium">{user?.birthday || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.gender')}</Text>
              <div className="text-base font-medium">
                {user?.gender === 'MALE'
                  ? t('client:profile.male')
                  : user?.gender === 'FEMALE'
                    ? t('client:profile.female')
                    : user?.gender === 'OTHER'
                      ? t('client:profile.other')
                      : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.identityNumber')}</Text>
              <div className="text-base font-medium">{user?.identityNumber || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.bloodType')}</Text>
              <div className="text-base font-medium">
                {user?.bloodType
                  ? user.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')
                  : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.height')}</Text>
              <div className="text-base font-medium">
                {user?.heightCm ? `${user.heightCm} cm` : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.weight')}</Text>
              <div className="text-base font-medium">
                {user?.weightKg ? `${user.weightKg} kg` : '--'}
              </div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.occupation')}</Text>
              <div className="text-base font-medium">{user?.occupation || '--'}</div>
            </div>
            <div>
              <Text type="secondary">{t('client:profile.insuranceNumber')}</Text>
              <div className="text-base font-medium">{user?.insuranceNumber || '--'}</div>
            </div>
          </div>

          <div>
            <Text type="secondary">{t('client:profile.address')}</Text>
            <div className="text-base font-medium">{user?.address || '--'}</div>
          </div>

          <div>
            <Text type="secondary">{t('client:profile.lifestyleNotes')}</Text>
            <Paragraph className="text-base whitespace-pre-line">
              {user?.lifestyleNotes || '--'}
            </Paragraph>
          </div>

          <div>
            <Button type="primary" onClick={() => setEditMode(true)} disabled={!user} size="large">
              {t('client:profile.editProfile')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditUser;
