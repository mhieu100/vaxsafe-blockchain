import {
  CalendarOutlined,
  CameraOutlined,
  EditOutlined,
  GiftOutlined,
  HeartOutlined,
  MailOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';
import { useState } from 'react';
import useAccountStore from '@/stores/useAccountStore';
import TabEditUser from './components/EditProfileTab';

const { Title, Text } = Typography;

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const { user, isAuthenticated } = useAccountStore();

  const handleOpenSettings = () => {};

  const handleChangeAvatar = () => {};

  const avatarUrl = user?.avatar || undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {}
        <Card className="mb-8 rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative" />

          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="relative">
                <Avatar
                  size={120}
                  src={avatarUrl}
                  icon={!avatarUrl && <UserOutlined />}
                  className="border-4 border-white shadow-xl bg-gradient-to-br from-blue-400 to-purple-500"
                />
                <Button
                  icon={<CameraOutlined />}
                  shape="circle"
                  size="small"
                  onClick={handleChangeAvatar}
                  className="absolute bottom-2 right-2 bg-white text-gray-600 border-2 border-white shadow-lg hover:bg-blue-50"
                />
                {isAuthenticated && (
                  <Badge status="success" className="absolute top-2 right-2" title="Online" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Title level={2} className="mb-0 text-gray-800">
                        {user?.fullName || <Skeleton.Input active size="small" className="!w-40" />}
                      </Title>
                      <Badge count="VIP" style={{ backgroundColor: '#f59e0b' }} />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <MailOutlined className="text-gray-400" />
                      <Text className="text-gray-600">{user?.email || '--'}</Text>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        Member since {user?.birthday ? new Date(user.birthday).getFullYear() : '--'}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrophyOutlined />
                        {isAuthenticated ? 'Gold Member' : 'Guest'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => setEditMode(!editMode)}
                      type={editMode ? 'primary' : 'default'}
                      className="rounded-lg"
                      disabled={!isAuthenticated}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button
                      icon={<SettingOutlined />}
                      className="rounded-lg"
                      onClick={handleOpenSettings}
                      disabled={!isAuthenticated}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                {isAuthenticated ? (
                  <Statistic
                    title="Total Orders"
                    value={12}
                    prefix={<ShoppingOutlined className="text-blue-500" />}
                    styles={{ content: { color: '#1890ff', fontSize: '20px' } }}
                  />
                ) : (
                  <Skeleton active paragraph={false} title={{ width: 80 }} />
                )}
              </div>
              <div className="text-center">
                {isAuthenticated ? (
                  <Statistic
                    title="Wishlist Items"
                    value={8}
                    prefix={<HeartOutlined className="text-red-500" />}
                    styles={{ content: { color: '#f5222d', fontSize: '20px' } }}
                  />
                ) : (
                  <Skeleton active paragraph={false} title={{ width: 90 }} />
                )}
              </div>
              <div className="text-center">
                {isAuthenticated ? (
                  <Statistic
                    title="Reward Points"
                    value={2450}
                    prefix={<GiftOutlined className="text-orange-500" />}
                    styles={{ content: { color: '#fa8c16', fontSize: '20px' } }}
                  />
                ) : (
                  <Skeleton active paragraph={false} title={{ width: 100 }} />
                )}
              </div>
              <div className="text-center">
                {isAuthenticated ? (
                  <Statistic
                    title="Total Saved"
                    value={189}
                    prefix="$"
                    suffix="USD"
                    styles={{ content: { color: '#52c41a', fontSize: '20px' } }}
                  />
                ) : (
                  <Skeleton active paragraph={false} title={{ width: 90 }} />
                )}
              </div>
            </div>
          </div>
        </Card>

        {}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card className="rounded-xl shadow-sm border-0">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white">
                    <UserOutlined className="text-xl" />
                  </div>
                  <Title level={3} className="!mb-0 !text-gray-800">
                    Health Profile
                  </Title>
                </div>
              </div>

              <TabEditUser editMode={editMode} setEditMode={setEditMode} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Profile;
