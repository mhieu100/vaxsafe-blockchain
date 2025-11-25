import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth.service';
import { useAccountStore } from '@/stores/useAccountStore';

const DropdownUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const logout = useAccountStore((state) => state.logout);
  const user = useAccountStore((state) => state.user);

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response && response.statusCode === 200) {
      logout();
      message.success(t('user.logoutSuccess'));
      navigate('/');
    }
  };

  const userItems = [
    {
      key: 'profile',
      label: t('user.profile'),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
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
    <Dropdown menu={{ items: userItems }} placement="bottomRight" className="hidden md:block">
      <Avatar
        src={
          user?.avatar ||
          'https://imgs.search.brave.com/kRzOEK2P26KHgRlY94E5DGE517Q4IJTULPg_lFWXLSU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHlw/aXguY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIxLzEwL2Fu/aW1lLWF2YXRhci1w/cm9maWxlLXBpY3R1/cmUtdGh5cGl4LTI0/LTcwMHg3MDAuanBn'
        }
        icon={<UserOutlined />}
        className="cursor-pointer"
        size="default"
      />
    </Dropdown>
  );
};

export default DropdownUser;
