import {
  CameraOutlined,
  QrcodeOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const CardInfoUser = ({ setOpen }) => {
  const user = useAccountStore((state) => state.user);
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated);

  const _memberSince = useMemo(() => {
    if (!user?.createdAt) return '--'; // Assuming createdAt exists, or fallback
    try {
      return dayjs(user.createdAt).format('MMM YYYY');
    } catch {
      return '--';
    }
  }, [user]);

  const avatarUrl = user?.avatar || undefined;

  return (
    <Card className="!mb-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden bg-white">
      <div className="p-6 flex flex-col md:flex-row items-center gap-8">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="border-4 border-white bg-slate-100"
            />
          </div>
          <Button
            icon={<CameraOutlined />}
            shape="circle"
            size="small"
            onClick={() => setOpen(true)}
            className="absolute bottom-0 right-0 bg-white text-slate-600 border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
            <Title level={2} className="!mb-0 text-slate-800">
              {user?.fullName || <Skeleton.Input active size="small" className="!w-40" />}
            </Title>
            {isAuthenticated && (
              <Tag
                color="blue"
                className="rounded-full px-3 border-0 bg-blue-50 text-blue-600 font-bold"
              >
                PATIENT
              </Tag>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 text-slate-500 mb-4 justify-center md:justify-start">
            <Text className="text-slate-500">
              ID: <span className="font-mono text-slate-700 font-medium">#{user?.id || '---'}</span>
            </Text>
            <span className="hidden md:inline">•</span>
            <Text className="text-slate-500">{user?.email || '--'}</Text>
            <span className="hidden md:inline">•</span>
            <Text className="text-slate-500">{user?.phone || '--'}</Text>
          </div>

          <div className="flex gap-2 justify-center md:justify-start">
            <Tag
              icon={<SafetyCertificateFilled />}
              color="success"
              className="px-3 py-1 rounded-lg text-sm"
            >
              Identity Verified
            </Tag>
          </div>
        </div>

        {/* QR Code Section (Decorative) */}
        <div className="hidden md:flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <QrcodeOutlined className="text-4xl text-slate-800 mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scan ID</span>
        </div>
      </div>
    </Card>
  );
};

export default CardInfoUser;
