import { CalendarOutlined, LockOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { ModalUpdateAvatar, ModalUpdatePassword } from '@/components/modal/profile';
import { useAccountStore } from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const AdminProfilePage = () => {
  const user = useAccountStore((state) => state.user);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const getRoleName = (role) => {
    const roleMap = {
      ADMIN: 'Quản trị viên',
      DOCTOR: 'Bác sĩ',
      CASHIER: 'Thu ngân',
    };
    return roleMap[role] || role;
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: (
        <Card>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Họ và tên">{user?.fullName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{user?.email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Space>
                <Text strong style={{ color: '#1890ff' }}>
                  {getRoleName(user?.role)}
                </Text>
              </Space>
            </Descriptions.Item>
            {user?.centerName && (
              <Descriptions.Item label="Trung tâm">{user.centerName}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SettingOutlined /> Cài đặt
        </span>
      ),
      children: (
        <Card>
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Bảo mật</Title>
              <Button
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
                size="large"
              >
                Đổi mật khẩu
              </Button>
            </div>

            <div>
              <Title level={5}>Ảnh đại diện</Title>
              <Button
                icon={<UserOutlined />}
                onClick={() => setAvatarModalVisible(true)}
                size="large"
              >
                Cập nhật ảnh đại diện
              </Button>
            </div>
          </Space>
        </Card>
      ),
    },
  ];

  // Add activity tab for doctors
  if (user?.role === 'DOCTOR') {
    tabItems.push({
      key: '3',
      label: (
        <span>
          <CalendarOutlined /> Hoạt động
        </span>
      ),
      children: (
        <Card>
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Thống kê hoạt động sẽ được cập nhật sớm</Text>
            </div>
          </Space>
        </Card>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <Row gutter={[24, 24]} align="middle">
            <Col>
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
                className="border-4 border-blue-100"
              />
            </Col>
            <Col flex="auto">
              <Title level={2} className="!mb-2">
                {user?.fullName || 'User'}
              </Title>
              <Space size="large">
                <Text type="secondary">
                  <UserOutlined /> {getRoleName(user?.role)}
                </Text>
                {user?.centerName && (
                  <Text type="secondary">
                    <CalendarOutlined /> {user.centerName}
                  </Text>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Profile Content */}
        <Card>
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>

        {/* Modals */}
        <ModalUpdateAvatar open={avatarModalVisible} setOpen={setAvatarModalVisible} />
        <ModalUpdatePassword open={passwordModalVisible} setOpen={setPasswordModalVisible} />
      </div>
    </div>
  );
};

export default AdminProfilePage;
