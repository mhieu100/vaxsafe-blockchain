import {
  AppstoreOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Menu } from 'antd';

const ProfileSidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      key: '1',
      icon: <AppstoreOutlined className="text-lg" />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <MedicineBoxOutlined className="text-lg" />,
      label: 'My Records',
    },
    {
      key: '3',
      icon: <CalendarOutlined className="text-lg" />,
      label: 'Appointments',
    },
    {
      key: '4',
      icon: <TeamOutlined className="text-lg" />,
      label: 'Family Members',
    },
    {
      key: '5',
      icon: <SettingOutlined className="text-lg" />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = (e) => {
    onTabChange(e.key);
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
      <div className="p-4 pb-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">
          Menu
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
