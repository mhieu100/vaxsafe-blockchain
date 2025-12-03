import { BellOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, Modal, message, Select, Spin, Switch, Typography } from 'antd';
import { useEffect, useState } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notification.service';

const { Title, Text } = Typography;

const SettingsModal = ({ open, setOpen, setSecurityModalVisible }) => {
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
      message.error('Không thể tải cài đặt thông báo');
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
      message.success('Đã cập nhật cài đặt');
    } catch (error) {
      console.error('Failed to update settings:', error);
      message.error('Không thể cập nhật cài đặt');
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

  return (
    <Modal
      title={
        <Title level={4} className="mb-0">
          Account Settings
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
                    <Text strong>Email Notifications</Text>
                    <Text type="secondary" className="block text-sm">
                      Enable or disable all email notifications
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
                    <Text strong>Appointment Reminders</Text>
                    <Text type="secondary" className="block text-sm">
                      Get notified before your scheduled appointments
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
                    <Text strong>Next Dose Reminders</Text>
                    <Text type="secondary" className="block text-sm">
                      Receive reminders for upcoming vaccine doses
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
                    <Text strong>Two-Factor Authentication</Text>
                    <Text type="secondary" className="block text-sm">
                      Add an extra layer of security to your account
                    </Text>
                  </div>
                </div>
                <Button type="primary" onClick={handleSecurityConfig}>
                  Configure
                </Button>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SafetyOutlined className="text-purple-500 text-lg" />
                  <div>
                    <Text strong>Profile Visibility</Text>
                    <Text type="secondary" className="block text-sm">
                      Control who can see your profile information
                    </Text>
                  </div>
                </div>
                <Select defaultValue="friends" style={{ width: 120 }}>
                  <Select.Option value="public">Public</Select.Option>
                  <Select.Option value="friends">Friends</Select.Option>
                  <Select.Option value="private">Private</Select.Option>
                </Select>
              </div>
            </Card>

            {/* Language Settings */}
            <Card className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SafetyOutlined className="text-indigo-500 text-lg" />
                  <div>
                    <Text strong>Language Preference</Text>
                    <Text type="secondary" className="block text-sm">
                      Choose your preferred language
                    </Text>
                  </div>
                </div>
                <Select defaultValue="en" style={{ width: 120 }}>
                  <Select.Option value="en">EN</Select.Option>
                  <Select.Option value="vi">VI</Select.Option>
                </Select>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-lg border border-red-200 bg-red-50">
              <Title level={5} className="text-red-600 mb-4">
                Danger Zone
              </Title>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Delete Account</Text>
                    <Text type="secondary" className="block text-sm">
                      Permanently delete your account and all data
                    </Text>
                  </div>
                  <Button danger>Delete Account</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Sign Out All Devices</Text>
                    <Text type="secondary" className="block text-sm">
                      Sign out from all devices except this one
                    </Text>
                  </div>
                  <Button danger>Sign Out All</Button>
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
