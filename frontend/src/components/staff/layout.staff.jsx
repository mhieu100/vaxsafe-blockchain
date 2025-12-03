import {
  CalendarOutlined,
  DashboardOutlined,
  EditOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Badge, Dropdown, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelect from '@/components/common/ui/LanguageSwitcher';
import { callLogout } from '@/services/auth.service';
import { useAccountStore } from '@/stores/useAccountStore';

const LayoutStaff = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'staff']);
  const user = useAccountStore((state) => state.user);
  const logout = useAccountStore((state) => state.logout);

  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
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
      onClick: () => navigate('/staff/profile'),
    },
    {
      key: 'logout',
      label: t('common:user.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuSidebar = [
    {
      path: '/staff/dashboard',
      icon: <DashboardOutlined />,
      name: <Link to="/staff/dashboard">{t('staff:dashboard.title')}</Link>,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/dashboard-doctor',
      icon: <DashboardOutlined />,
      name: <Link to="/staff/dashboard-doctor">{t('staff:dashboard.title')}</Link>,
      roles: ['DOCTOR'],
    },
    {
      path: '/staff/my-schedule',
      icon: <CalendarOutlined />,
      name: <Link to="/staff/my-schedule">{t('staff:doctorSchedule.mySchedule')}</Link>,
      roles: ['DOCTOR'],
    },
    {
      path: '/staff/walk-in-booking',
      name: <Link to="/staff/walk-in-booking">Đặt lịch Walk-in</Link>,
      icon: <UserAddOutlined />,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/pending-appointments',
      name: <Link to="/staff/pending-appointments">{t('staff:appointments.title')}</Link>,
      icon: <EditOutlined />,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/doctor-schedule',
      name: <Link to="/staff/doctor-schedule">{t('staff:doctorSchedule.title')}</Link>,
      icon: <EditOutlined />,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/calendar-view',
      name: <Link to="/staff/calendar-view">{t('staff:calendar.title')}</Link>,
      icon: <CalendarOutlined />,
      roles: ['CASHIER', 'DOCTOR'],
    },
  ];

  const filterMenuByRole = (menuItems, userRole) => {
    return menuItems.filter((item) => item.roles.includes(userRole));
  };

  const getRole = (role) => {
    const roleKey = role?.toLowerCase();
    return t(`common:roles.${roleKey}`, role);
  };

  return (
    <ProLayout
      fixSiderbar
      fixedHeader
      defaultCollapsed
      pageTitleRender={false}
      title="VaxChain - Nhân viên"
      actionsRender={() => [
        <LanguageSelect key="language" />,
        <Dropdown
          key="user"
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <div className="cursor-pointer flex items-center gap-2">
            <Badge dot={user?.isVerified}>
              <Avatar src={user?.avatar} className="bg-brand-primary">
                {user?.name?.charAt(0) || <UserOutlined />}
              </Avatar>
            </Badge>
            <div className="hidden md:block">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-gray-500">{getRole(user?.role)}</div>
            </div>
          </div>
        </Dropdown>,
      ]}
      menuDataRender={() => filterMenuByRole(menuSidebar, user.role)}
      layout="mix"
      location={{
        pathname: activeMenu,
      }}
      logoRender={() => (
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-2xl text-brand-primary" />
          <span className="text-xl font-bold text-gray-900">VaxChain</span>
        </div>
      )}
    >
      <Outlet />
    </ProLayout>
  );
};

export default LayoutStaff;
