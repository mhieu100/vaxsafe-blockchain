import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import { useState } from 'react';
import { ModalUpdatePassword } from '@/components/modal/profile';
import TabEditUser from '@/components/tab/TabEditUser';

const SettingsTab = ({ editMode, setEditMode }) => {
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile Information
        </span>
      ),
      children: <TabEditUser editMode={editMode} setEditMode={setEditMode} />,
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <div className="py-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Account Security</h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-700">Password</div>
              <div className="text-slate-500 text-sm">Change your account password</div>
            </div>
            <Button onClick={() => setPasswordModalVisible(true)}>Change Password</Button>
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
