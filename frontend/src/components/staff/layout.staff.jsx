import {
  CalendarOutlined,
  DashboardOutlined,
  EditOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Badge, Dropdown, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { callLogout } from '@/config/api.auth';
import { useAccountStore } from '@/stores/useAccountStore';

const LayoutStaff = () => {
  const navigate = useNavigate();
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
      localStorage.removeItem('access_token');
      logout();
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuSidebar = [
    {
      path: '/staff/dashboard',
      icon: <DashboardOutlined />,
      name: <Link to="/staff/dashboard">Bảng điều khiển</Link>,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/dashboard-doctor',
      icon: <DashboardOutlined />,
      name: <Link to="/staff/dashboard-doctor">Bảng điều khiển</Link>,
      roles: ['DOCTOR'],
    },
    {
      path: '/staff/my-schedule',
      icon: <CalendarOutlined />,
      name: <Link to="/staff/my-schedule">Lịch của tôi</Link>,
      roles: ['DOCTOR'],
    },
    {
      path: '/staff/pending-appointments',
      name: <Link to="/staff/pending-appointments">Quản lý lịch hẹn</Link>,
      icon: <EditOutlined />,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/doctor-schedule',
      name: <Link to="/staff/doctor-schedule">Lịch bác sĩ</Link>,
      icon: <EditOutlined />,
      roles: ['CASHIER'],
    },
    {
      path: '/staff/calendar-view',
      name: <Link to="/staff/calendar-view">Lịch làm việc</Link>,
      icon: <CalendarOutlined />,
      roles: ['CASHIER', 'DOCTOR'],
    },
  ];

  const filterMenuByRole = (menuItems, userRole) => {
    return menuItems.filter((item) => item.roles.includes(userRole));
  };

  const getRole = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'Bác sĩ';
      case 'CASHIER':
        return 'Nhân viên thu ngân';
      default:
        return role;
    }
  };

  return (
    <ProLayout
      fixSiderbar
      fixedHeader
      defaultCollapsed
      pageTitleRender={false}
      title="VaxChain - Nhân viên"
      actionsRender={() => [
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
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
