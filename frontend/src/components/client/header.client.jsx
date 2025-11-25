import {
  DashboardOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Input, Layout, Menu, message, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '@/services/auth.service';
import { useAccountStore } from '@/stores/useAccountStore';
import useCartStore from '@/stores/useCartStore';
import { LanguageSwitcher as LanguageSelect } from '../common/ui';
import DropdownUser from '../dropdown/DropdownUser';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Navbar = () => {
  const { t } = useTranslation('common');
  const itemCount = useCartStore((state) => state.totalQuantity());

  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
  const user = useAccountStore((state) => state.user);
  const logout = useAccountStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [_searchValue, setSearchValue] = useState('');

  const handleLogout = async () => {
    const res = await authService.logout();
    if (res && res && +res.statusCode === 200) {
      localStorage.removeItem('access_token');
      logout();
      message.success(t('user.logoutSuccess'));
      navigate('/');
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleMobileUserMenuClick = async ({ key }) => {
    if (key === 'logout') {
      await handleLogout();
    } else {
      navigate(`/${key}`);
    }
    setMobileMenuVisible(false);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuVisible(false);
  };

  const handleMobileMenuItemClick = ({ key }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const onSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setSearchValue('');
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('header.home'),
    },
    {
      key: '/vaccine',
      icon: <ShoppingOutlined />,
      label: t('header.vaccines'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: t('user.profile'),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            key: 'admin/dashboard',
            label: 'Trang quản trị',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/admin/dashboard'),
          },
        ]
      : []),
    ...(user?.role === 'DOCTOR' || user?.role === 'CASHIER'
      ? [
          {
            key: 'staff/dashboard',
            label: 'Trang nhân viên',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/staff/dashboard'),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('user.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <AntHeader className="sticky top-0 z-50 !bg-white px-4 shadow-sm md:px-6">
        <div className="mx-auto flex h-full max-w-[1220px] items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex cursor-pointer items-center gap-2 text-xl font-bold text-blue-600 md:text-2xl"
            >
              <SafetyCertificateOutlined className="text-xl md:text-2xl text-brand-primary" />
              <span className="hidden text-lg font-bold text-gray-900 sm:block md:text-xl">
                SafeVax
              </span>
            </Link>

            <Menu
              mode="horizontal"
              onClick={handleMenuClick}
              selectedKeys={[location.pathname?.split('?')?.[0] ?? '']}
              items={menuItems}
              style={{
                border: 'none',
                background: 'transparent',
                minWidth: '300px',
              }}
              className="hidden lg:flex"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex md:items-center">
              <Search
                placeholder={t('header.searchPlaceholder')}
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
              />
            </div>

            <Space className="hidden sm:flex">
              <LanguageSelect />

              <Badge count={itemCount} size="small" className="mr-1 md:mr-0">
                <Button
                  icon={<ShoppingCartOutlined />}
                  size="middle"
                  onClick={() => navigate('/cart')}
                  className="border-none shadow-none hover:bg-slate-100"
                  title={t('header.cart')}
                />
              </Badge>
            </Space>

            <div className="hidden md:flex md:items-center md:gap-2">
              {!isAuthenticated ? (
                <>
                  <Button onClick={() => navigate('/login')} className="text-sm" size="middle">
                    {t('header.login')}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 text-sm hover:bg-blue-700"
                    size="middle"
                  >
                    {t('header.register')}
                  </Button>
                </>
              ) : (
                <DropdownUser />
              )}
            </div>

            <Button
              icon={<MenuOutlined />}
              size="middle"
              className="flex border-none shadow-none hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenuVisible(true)}
              title="Menu"
            />
          </div>
        </div>
      </AntHeader>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-brand-primary" />
            <span className="font-bold">SafeVax</span>
          </div>
        }
        placement="right"
        onClose={handleMobileMenuClose}
        open={mobileMenuVisible}
        width={300}
        className="md:hidden"
      >
        <div className="flex h-full flex-col">
          {/* User Section */}
          <div className="border-b border-gray-200 pb-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    user?.avatar ||
                    'https://imgs.search.brave.com/kRzOEK2P26KHgRlY94E5DGE517Q4IJTULPg_lFWXLSU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHlw/aXguY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIxLzEwL2Fu/aW1lLWF2YXRhci1w/cm9maWxlLXBpY3R1/cmUtdGh5cGl4LTI0/LTcwMHg3MDAuanBn'
                  }
                  icon={<UserOutlined />}
                  size="large"
                />
                <div className="overflow-hidden">
                  <div className="truncate font-medium">{user?.name || 'User'}</div>
                  <div className="truncate text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="primary"
                  block
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuVisible(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t('header.login')}
                </Button>
                <Button
                  block
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuVisible(false);
                  }}
                >
                  {t('header.register')}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4">
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMobileMenuItemClick}
              className="border-none"
            />

            {/* User Menu Items (if authenticated) */}
            {isAuthenticated && (
              <>
                <div className="my-4 border-t border-gray-200" />
                <Menu
                  mode="vertical"
                  items={userMenuItems}
                  onClick={handleMobileUserMenuClick}
                  className="border-none"
                />
              </>
            )}
          </div>

          {/* Additional Mobile Actions */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                icon={<HeartOutlined />}
                onClick={() => {
                  navigate('/wishlist');
                  setMobileMenuVisible(false);
                }}
                block
              >
                {t('header.wishlist')}
              </Button>
              <Button
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  navigate('/cart');
                  setMobileMenuVisible(false);
                }}
                block
              >
                <Badge count={itemCount} size="small">
                  {t('header.cart')}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
