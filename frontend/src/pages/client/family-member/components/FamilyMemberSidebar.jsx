import {
  AppstoreOutlined,
  CalendarOutlined,
  IdcardOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Menu, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const FamilyMemberSidebar = ({ member, activeTab, onTabChange }) => {
  const { t } = useTranslation(['client']);

  const menuItems = [
    {
      key: '1',
      icon: <AppstoreOutlined className="text-lg" />,
      label: t('client:sidebar.dashboard'),
    },
    {
      key: '2',
      icon: <CalendarOutlined className="text-lg" />,
      label: t('client:sidebar.appointments'),
    },
    {
      key: '3',
      icon: <SafetyCertificateOutlined className="text-lg" />,
      label: t('client:sidebar.vaccineRecord'),
    },
  ];

  const handleMenuClick = (e) => {
    onTabChange(e.key);
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24 h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 flex flex-col items-center border-b border-slate-50">
        <div className="relative group mb-4">
          <div className="p-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              className="border-4 border-white bg-slate-100"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-slate-200">
            <div className="text-lg leading-none">{member?.gender === 'FEMALE' ? '👩' : '👨'}</div>
          </div>
        </div>

        <div className="text-center w-full mb-4">
          <Title level={4} className="!mb-1 text-slate-800 truncate" title={member?.fullName}>
            {member?.fullName || '...'}
          </Title>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Tag
              color="purple"
              className="rounded-full px-2 border-0 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase"
            >
              {member?.relationship || 'FAMILY'}
            </Tag>
            {member?.gender && (
              <Tag className="rounded-full px-2 border-0 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase m-0">
                {member.gender}
              </Tag>
            )}
          </div>
        </div>

        <div className="w-full space-y-3 bg-slate-50 p-4 rounded-xl">
          <div className="flex items-start justify-between text-sm">
            <Text type="secondary" className="flex items-center gap-2">
              <CalendarOutlined />
              <span className="text-xs">DOB</span>
            </Text>
            <Text strong>
              {member?.dateOfBirth ? dayjs(member.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
            </Text>
          </div>
          <div className="flex items-start justify-between text-sm">
            <Text type="secondary" className="flex items-center gap-2">
              <PhoneOutlined />
              <span className="text-xs">Phone</span>
            </Text>
            <Text strong>{member?.phone || 'N/A'}</Text>
          </div>
          <div className="flex items-start justify-between text-sm">
            <Text type="secondary" className="flex items-center gap-2">
              <IdcardOutlined />
              <span className="text-xs">ID</span>
            </Text>
            <Text strong className="truncate max-w-[120px]" title={member?.identityNumber}>
              {member?.identityNumber || 'N/A'}
            </Text>
          </div>
          <div className="flex items-start justify-between text-sm">
            <Text type="secondary" className="flex items-center gap-2">
              <span className="text-xs">Height</span>
            </Text>
            <Text strong>{member?.heightCm ? `${member.heightCm} cm` : 'N/A'}</Text>
          </div>
          <div className="flex items-start justify-between text-sm">
            <Text type="secondary" className="flex items-center gap-2">
              <span className="text-xs">Weight</span>
            </Text>
            <Text strong>{member?.weightKg ? `${member.weightKg} kg` : 'N/A'}</Text>
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
          style={{ background: 'transparent' }}
        />
      </div>
    </Card>
  );
};

export default FamilyMemberSidebar;
