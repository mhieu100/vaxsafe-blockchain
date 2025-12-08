import { Button, Col, Form, Input, message, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '@/services/profile.service';
import { useAccountStore } from '@/stores/useAccountStore';

const { Text, Paragraph } = Typography;

const TabEditUser = ({ editMode, setEditMode }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['client', 'common']);
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

      const role = user.role || 'patient';

      await updateProfile(role, values);

      if (updateUserInfo) {
        updateUserInfo(values);
      }

      message.success(t('client:profile.updateSuccess'));
      setEditMode(false);
    } catch (error) {
      console.error('Update profile error:', error);
      message.error(
        error?.response?.data?.message || error?.message || t('client:profile.updateFailed')
      );
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
                label={t('client:profile.fullName')}
                name="fullName"
                rules={[{ required: true, message: t('client:profile.enterFullName') }]}
              >
                <Input className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('client:profile.email')}
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input disabled className="rounded-lg bg-slate-50 text-slate-500" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.phone')} name="phone">
                <Input className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('client:profile.dateOfBirth')}
                name="birthday"
                tooltip="Cannot be changed - used for blockchain identity"
              >
                <Input
                  disabled
                  placeholder={t('client:booking.selectDate')}
                  className="rounded-lg bg-slate-50 text-slate-500"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.gender')} name="gender">
                <Select placeholder={t('client:profile.selectGender')} className="rounded-lg">
                  <Select.Option value="MALE">{t('client:profile.male')}</Select.Option>
                  <Select.Option value="FEMALE">{t('client:profile.female')}</Select.Option>
                  <Select.Option value="OTHER">{t('client:profile.other')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('client:profile.identityNumber')}
                name="identityNumber"
                tooltip="Cannot be changed - used for blockchain identity"
              >
                <Input
                  disabled
                  placeholder={t('client:profile.identityNumber')}
                  className="rounded-lg bg-slate-50 text-slate-500"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item label={t('client:profile.bloodType')} name="bloodType">
                <Select placeholder={t('client:profile.selectBloodType')} className="rounded-lg">
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={`${t('client:profile.height')} (cm)`} name="heightCm">
                <Input type="number" placeholder="170" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={`${t('client:profile.weight')} (kg)`} name="weightKg">
                <Input type="number" placeholder="65" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('client:profile.address')} name="address">
            <Input.TextArea rows={2} className="rounded-lg" />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.occupation')} name="occupation">
                <Input placeholder={t('client:profile.enterOccupation')} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('client:profile.insuranceNumber')} name="insuranceNumber">
                <Input
                  placeholder={t('client:profile.enterInsuranceNumber')}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('client:profile.lifestyleNotes')} name="lifestyleNotes">
            <Input.TextArea
              rows={3}
              placeholder={t('client:profile.enterLifestyleNotes')}
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
              {t('client:profile.saveChanges')}
            </Button>
            <Button
              onClick={() => setEditMode(false)}
              disabled={loading}
              className="rounded-xl px-6 h-10 hover:bg-slate-100"
            >
              {t('client:profile.cancel')}
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
                {t('client:profile.fullName')}
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
                {t('client:profile.email')}
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">{user?.email || '--'}</div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                {t('client:profile.phone')}
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">{user?.phone || '--'}</div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                {t('client:profile.dateOfBirth')}
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
                {t('client:profile.gender')}
              </Text>
              <div className="text-lg font-medium text-slate-800 mt-1">
                {user?.gender === 'MALE'
                  ? t('client:profile.male')
                  : user?.gender === 'FEMALE'
                    ? t('client:profile.female')
                    : user?.gender === 'OTHER'
                      ? t('client:profile.other')
                      : '--'}
              </div>
            </div>
            <div className="border-b border-slate-100 pb-2">
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider font-semibold text-slate-400"
              >
                {t('client:profile.identityNumber')}
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
                {t('client:profile.bloodType')}
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
                {t('client:profile.height')}
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
                {t('client:profile.weight')}
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
                {t('client:profile.occupation')}
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
                {t('client:profile.insuranceNumber')}
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
              {t('client:profile.address')}
            </Text>
            <div className="text-lg font-medium text-slate-800 mt-1">{user?.address || '--'}</div>
          </div>

          <div className="border-b border-slate-100 pb-2">
            <Text
              type="secondary"
              className="text-xs uppercase tracking-wider font-semibold text-slate-400"
            >
              {t('client:profile.lifestyleNotes')}
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
              {t('client:profile.editProfile')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditUser;
