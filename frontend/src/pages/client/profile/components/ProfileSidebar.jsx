import {
  AppstoreOutlined,
  CameraOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Menu, Skeleton, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const ProfileSidebar = ({ activeTab, onTabChange, setAvatarModalVisible }) => {
  const { t } = useTranslation(['client']);
  const user = useAccountStore((state) => state.user);

  const menuItems = [
    {
      key: '1',
      icon: <AppstoreOutlined className="text-lg" />,
      label: t('client:sidebar.dashboard'),
    },
    {
      key: '2',
      icon: <MedicineBoxOutlined className="text-lg" />,
      label: t('client:sidebar.myRecords'),
    },
    {
      key: '4',
      icon: <TeamOutlined className="text-lg" />,
      label: t('client:sidebar.familyMembers'),
    },
    {
      key: '5',
      icon: <SettingOutlined className="text-lg" />,
      label: t('client:sidebar.accountSettings'),
    },
  ];

  const handleMenuClick = (e) => {
    onTabChange(e.key);
  };

  const avatarUrl = user?.avatar || undefined;

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24 h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 flex flex-col items-center border-b border-slate-50">
        <div className="relative group mb-4">
          <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
            <Avatar
              size={80}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="border-4 border-white bg-slate-100"
            />
          </div>
          <Button
            icon={<CameraOutlined />}
            shape="circle"
            size="small"
            onClick={() => setAvatarModalVisible(true)}
            className="absolute bottom-0 right-0 bg-white text-slate-600 border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="text-center w-full">
          <Title level={4} className="!mb-1 text-slate-800 truncate" title={user?.fullName}>
            {user?.fullName || <Skeleton.Input active size="small" />}
          </Title>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag
              color="blue"
              className="rounded-full px-2 border-0 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase"
            >
              {t('client:cardInfo.patient')}
            </Tag>
            <Text type="secondary" className="text-xs font-mono">
              #{user?.id || '---'}
            </Text>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-6">
          {t('client:sidebar.menu')}
        </h3>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          items={menuItems}
          className="border-0 custom-profile-menu px-2"
          style={{
            background: 'transparent',
          }}
        />
      </div>

      <div className="p-4 border-t border-slate-50">
        <div className="text-center">
          <Text className="text-[10px] text-slate-300">Ver 1.0.0</Text>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSidebar;
