import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalUpdatePassword } from '@/components/modal/profile';
import TabEditUser from '@/components/tab/TabEditUser';

const SettingsTab = ({ editMode, setEditMode }) => {
  const { t } = useTranslation(['client']);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          {t('client:settings.profileInfo')}
        </span>
      ),
      children: <TabEditUser editMode={editMode} setEditMode={setEditMode} />,
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          {t('client:settings.security')}
        </span>
      ),
      children: (
        <div className="py-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {t('client:settings.accountSecurity')}
          </h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-700">{t('client:settings.password')}</div>
              <div className="text-slate-500 text-sm">
                {t('client:settings.changePasswordDesc')}
              </div>
            </div>
            <Button onClick={() => setPasswordModalVisible(true)}>
              {t('client:profile.changePassword')}
            </Button>
          </div>
          <ModalUpdatePassword open={passwordModalVisible} setOpen={setPasswordModalVisible} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <Tabs defaultActiveKey="profile" items={items} />
    </div>
  );
};

export default SettingsTab;
