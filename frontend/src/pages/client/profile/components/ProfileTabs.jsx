import { Typography } from 'antd';
import AppointmentScheduleTab from './AppointmentScheduleTab';
import DashboardTab from './DashboardTab';
import FamilyManagerTab from './FamilyManagerTab';
import MyRecordsTab from './MyRecordsTab';
import SettingsTab from './SettingsTab';

const { Title } = Typography;

const ProfileTabs = ({ activeTab, onTabChange, editMode, setEditMode }) => {
  const tabConfig = {
    1: {
      title: 'Dashboard',
      content: <DashboardTab onTabChange={onTabChange} />,
    },
    2: {
      title: 'My Records',
      content: <MyRecordsTab />,
    },
    3: {
      title: 'Appointments',
      content: <AppointmentScheduleTab />,
    },
    4: {
      title: 'Family Members',
      content: <FamilyManagerTab />,
    },
    5: {
      title: 'Settings',
      content: <SettingsTab editMode={editMode} setEditMode={setEditMode} />,
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig['1'];

  return (
    <div className="profile-tab-content">
      {/* Tab Content */}
      <div className="animate-fade-in">{currentTab.content}</div>
    </div>
  );
};

export default ProfileTabs;
