import {
  BankOutlined,
  BellOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  SafetyCertificateFilled,
  SafetyOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  message,
  Space,
  Tooltip,
  theme,
} from 'antd';
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

  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="!bg-slate-900"
        style={{
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          boxShadow: '4px 0 24px 0 rgba(0,0,0,0.02)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-center px-6 border-b border-slate-800/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                <SafetyCertificateFilled className="text-xl text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col animate-fade-in">
                  <span className="text-lg font-bold text-white tracking-tight leading-none">
                    VaxSafe
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                    Admin Portal
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[activeMenu]}
              defaultOpenKeys={['user-management']}
              items={menuItems}
              onClick={handleMenuClick}
              className="!bg-transparent px-3 border-none font-medium"
            />
          </div>

          {/* User Profile - Bottom Sidebar */}
          <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
            <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
              <div
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800 transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Badge dot={user?.isVerified} offset={[-4, 4]} color="green">
                  <Avatar
                    src={user?.avatar}
                    size="large"
                    className="bg-gradient-to-br from-blue-500 to-indigo-500 border-2 border-slate-700 shadow-sm"
                    icon={<UserOutlined />}
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Badge>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-200 leading-tight truncate">
                      {user?.fullName}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate mt-0.5">
                      {getRole(user?.role)}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 80,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
          }}
        >
          {/* Left Header: Collapse & Search */}
          <div className="flex items-center gap-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '18px',
                width: 44,
                height: 44,
              }}
              className="hover:bg-slate-100 rounded-xl text-slate-600"
            />
            <div className="hidden md:block w-64">
              <Input
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Search..."
                className="rounded-xl border-slate-200 bg-slate-50 hover:bg-white focus:bg-white transition-all py-2"
                bordered={false}
              />
            </div>
          </div>

          {/* Right Header: Actions */}
          <Space size={20}>
            <Tooltip title="Notifications">
              <Button
                type="text"
                icon={<BellOutlined className="text-xl text-slate-600" />}
                className="rounded-full w-10 h-10 hover:bg-slate-50 flex items-center justify-center"
              />
            </Tooltip>

            <LanguageSelect />
          </Space>
        </Header>

        <Content style={{ margin: '24px 24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
