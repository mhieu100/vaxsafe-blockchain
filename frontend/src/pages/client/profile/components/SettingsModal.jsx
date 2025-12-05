import { BellOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, Modal, message, Select, Spin, Switch, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notification.service';

const { Title, Text } = Typography;

const SettingsModal = ({ open, setOpen, setSecurityModalVisible }) => {
  const { t, i18n } = useTranslation(['client']);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    appointmentReminderEnabled: true,
    nextDoseReminderEnabled: true,
  });

  // Fetch settings when modal opens
  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getNotificationSettings();
      if (response?.data) {
        setSettings({
          emailEnabled: response.data.emailEnabled ?? true,
          appointmentReminderEnabled: response.data.appointmentReminderEnabled ?? true,
          nextDoseReminderEnabled: response.data.nextDoseReminderEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      message.error(t('client:settingsModal.loadSettingsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      setUpdating(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      await updateNotificationSettings(newSettings);
      message.success(t('client:settingsModal.updateSettingsSuccess'));
    } catch (error) {
      console.error('Failed to update settings:', error);
      message.error(t('client:settingsModal.updateSettingsFailed'));
      // Revert on error
      setSettings(settings);
    } finally {
      setUpdating(false);
    }
  };

  const handleSecurityConfig = () => {
    setOpen(false);
    setSecurityModalVisible(true);
  };

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem('i18nextLng', value);
  };

  return (
    <Modal
      title={
        <Title level={4} className="mb-0">
          {t('client:settingsModal.title')}
        </Title>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
      className="settings-modal"
    >
      <Spin spinning={loading}>
        <div className="py-4">
          <div className="!space-y-6">
            {/* Email Notifications */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BellOutlined className="text-blue-500 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.emailNotifications')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.emailNotificationsDesc')}
                    </Text>
                  </div>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onChange={(checked) => handleSettingChange('emailEnabled', checked)}
                  disabled={updating}
                />
              </div>
            </Card>

            {/* Appointment Reminders */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BellOutlined className="text-orange-500 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.appointmentReminders')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.appointmentRemindersDesc')}
                    </Text>
                  </div>
                </div>
                <Switch
                  checked={settings.appointmentReminderEnabled}
                  onChange={(checked) => handleSettingChange('appointmentReminderEnabled', checked)}
                  disabled={updating || !settings.emailEnabled}
                />
              </div>
            </Card>

            {/* Next Dose Reminders */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BellOutlined className="text-green-500 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.nextDoseReminders')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.nextDoseRemindersDesc')}
                    </Text>
                  </div>
                </div>
                <Switch
                  checked={settings.nextDoseReminderEnabled}
                  onChange={(checked) => handleSettingChange('nextDoseReminderEnabled', checked)}
                  disabled={updating || !settings.emailEnabled}
                />
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <LockOutlined className="text-green-600 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.twoFactorAuth')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.twoFactorAuthDesc')}
                    </Text>
                  </div>
                </div>
                <Button type="primary" onClick={handleSecurityConfig}>
                  {t('client:settingsModal.configure')}
                </Button>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SafetyOutlined className="text-purple-500 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.profileVisibility')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.profileVisibilityDesc')}
                    </Text>
                  </div>
                </div>
                <Select defaultValue="friends" style={{ width: 120 }}>
                  <Select.Option value="public">{t('client:settingsModal.public')}</Select.Option>
                  <Select.Option value="friends">{t('client:settingsModal.friends')}</Select.Option>
                  <Select.Option value="private">{t('client:settingsModal.private')}</Select.Option>
                </Select>
              </div>
            </Card>

            {/* Language Settings */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SafetyOutlined className="text-indigo-500 text-lg" />
                  <div>
                    <Text strong>{t('client:settingsModal.languagePreference')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.languagePreferenceDesc')}
                    </Text>
                  </div>
                </div>
                <Select
                  defaultValue={i18n.language}
                  style={{ width: 120 }}
                  onChange={handleLanguageChange}
                >
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="vi">Tiếng Việt</Select.Option>
                </Select>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-lg border border-red-200 bg-red-50">
              <Title level={5} className="text-red-600 mb-4">
                {t('client:settingsModal.dangerZone')}
              </Title>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>{t('client:settingsModal.deleteAccount')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.deleteAccountDesc')}
                    </Text>
                  </div>
                  <Button danger>{t('client:settingsModal.deleteAccount')}</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>{t('client:settingsModal.signOutAllDevices')}</Text>
                    <Text type="secondary" className="block text-sm">
                      {t('client:settingsModal.signOutAllDevicesDesc')}
                    </Text>
                  </div>
                  <Button danger>{t('client:settingsModal.signOutAll')}</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default SettingsModal;
