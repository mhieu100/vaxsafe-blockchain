import { Modal, Typography, Card, Select, Switch, Button } from 'antd';
import {
  BellOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsModal = ({ open, setOpen, setSecurityModalVisible }) => {
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
      <div className="py-4">
        <div className="!space-y-6">
          {/* Notification Settings */}
          <Card className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BellOutlined className="text-blue-500 text-lg" />
                <div>
                  <Text strong>Email Notifications</Text>
                  <Text type="secondary" className="block text-sm">
                    Receive updates about your orders and account
                  </Text>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>

          {/* Push Notifications */}
          <Card className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BellOutlined className="text-orange-500 text-lg" />
                <div>
                  <Text strong>Push Notifications</Text>
                  <Text type="secondary" className="block text-sm">
                    Get notified about appointment reminders
                  </Text>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>

          {/* SMS Notifications */}
          <Card className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BellOutlined className="text-green-500 text-lg" />
                <div>
                  <Text strong>SMS Notifications</Text>
                  <Text type="secondary" className="block text-sm">
                    Receive SMS for urgent health reminders
                  </Text>
                </div>
              </div>
              <Switch />
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
                <Select.Option value="en">English</Select.Option>
                <Select.Option value="vi">Tiếng Việt</Select.Option>
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
    </Modal>
  );
};

export default SettingsModal;
