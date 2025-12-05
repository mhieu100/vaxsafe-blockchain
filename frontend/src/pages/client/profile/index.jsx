import { Col, Row } from 'antd';
import { useState } from 'react';
import { ModalUpdateAvatar } from '@/components/modal/profile';
import CardInfoUser from './components/CardInfoUser';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileTabs from './components/ProfileTabs';

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <CardInfoUser setOpen={setAvatarModalVisible} />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />
          </Col>

          <Col xs={24} lg={18}>
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          </Col>
        </Row>

        <ModalUpdateAvatar open={avatarModalVisible} setOpen={setAvatarModalVisible} />
      </div>
    </div>
  );
};

export default ProfilePage;
