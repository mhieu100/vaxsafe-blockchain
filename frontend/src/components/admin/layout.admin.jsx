import {
  BankOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Layout, Menu, message, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelect from '@/components/common/ui/LanguageSwitcher';
import { callLogout } from '@/services/auth.service';
import { useAccountStore } from '@/stores/useAccountStore';

const { Header, Sider, Content } = Layout;

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'admin']);
  const user = useAccountStore((state) => state.user);
  const logout = useAccountStore((state) => state.logout);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res && +res.statusCode === 200) {
      localStorage.removeItem('token');
      logout();
      message.success(t('common:user.logoutSuccess'));
      navigate('/');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: t('common:user.personalInfo'),
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'logout',
      label: t('common:user.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: t('admin:dashboard.title'),
    },
    {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng',
      children: [
        {
          key: '/admin/patients',
          label: 'Bệnh nhân',
        },
        {
          key: '/admin/cashiers',
          label: 'Thu ngân',
        },
        {
          key: '/admin/doctors',
          label: 'Bác sĩ',
        },
      ],
    },
    {
      key: '/admin/vaccines',
      icon: <MedicineBoxOutlined />,
      label: t('admin:vaccines.title'),
    },
    {
      key: '/admin/centers',
      icon: <BankOutlined />,
      label: t('admin:centers.title'),
    },
    {
      key: '/admin/permissions',
      icon: <SafetyOutlined />,
      label: t('admin:permissions.title'),
    },
    {
      key: '/admin/news',
      icon: <NotificationOutlined />,
      label: t('admin:news.title'),
    },
    {
      key: '/admin/roles',
      icon: <KeyOutlined />,
      label: t('admin:roles.title'),
    },
  ];

  const getRole = (role) => {
    const roleKey = role?.toLowerCase();
    return t(`common:roles.${roleKey}`, role);
  };

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        style={{
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          zIndex: 10,
        }}
      >
        <div className="p-4 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-xl text-blue-500" />
            {!collapsed && <span className="text-lg font-bold text-gray-900">VaxChain</span>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          className="bg-white p-0 px-6 flex items-center justify-end"
          style={{
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            height: 64,
          }}
        >
          <Space size="middle">
            <LanguageSelect />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <div className="cursor-pointer flex items-center gap-2">
                <Badge dot={user?.isVerified}>
                  <Avatar src={user?.avatar} className="bg-blue-500">
                    {user?.fullName?.charAt(0) || <UserOutlined />}
                  </Avatar>
                </Badge>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{user?.fullName}</div>
                  <div className="text-xs text-gray-500">{getRole(user?.role)}</div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content className="m-5 p-5 bg-white rounded-lg">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
