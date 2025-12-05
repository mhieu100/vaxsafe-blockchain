import {
  AppstoreOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Menu } from 'antd';
import { useTranslation } from 'react-i18next';

const ProfileSidebar = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation(['client']);
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
      key: '3',
      icon: <CalendarOutlined className="text-lg" />,
      label: t('client:sidebar.appointments'),
    },
    {
      key: '4',
      icon: <TeamOutlined className="text-lg" />,
      label: t('client:sidebar.familyMembers'),
    },
    {
      key: '5',
      icon: <SettingOutlined className="text-lg" />,
      label: t('client:sidebar.settings'),
    },
  ];

  const handleMenuClick = (e) => {
    onTabChange(e.key);
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
      <div className="p-4 pb-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">
          {t('client:sidebar.menu')}
        </h3>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        onClick={handleMenuClick}
        items={menuItems}
        className="border-0 custom-profile-menu"
        style={{
          background: 'transparent',
        }}
      />
    </Card>
  );
};

export default ProfileSidebar;
