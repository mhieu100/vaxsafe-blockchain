import { useTranslation } from 'react-i18next';
import AppointmentScheduleTab from './AppointmentScheduleTab';
import DashboardTab from './DashboardTab';
import FamilyManagerTab from './FamilyManagerTab';
import MyRecordsTab from './MyRecordsTab';
import SettingsTab from './SettingsTab';

const ProfileTabs = ({ activeTab, onTabChange, editMode, setEditMode }) => {
  const { t } = useTranslation(['client']);
  const tabConfig = {
    1: {
      title: t('client:sidebar.dashboard'),
      content: <DashboardTab onTabChange={onTabChange} />,
    },
    2: {
      title: t('client:sidebar.myRecords'),
      content: <MyRecordsTab editMode={editMode} setEditMode={setEditMode} />,
    },
    3: {
      title: t('client:sidebar.appointments'),
      content: <AppointmentScheduleTab />,
    },
    4: {
      title: t('client:sidebar.familyMembers'),
      content: <FamilyManagerTab />,
    },
    5: {
      title: t('client:sidebar.settings'),
      content: <SettingsTab />,
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig['1'];

  return (
    <div className="profile-tab-content">
      {}
      <div className="animate-fade-in">{currentTab.content}</div>
    </div>
  );
};

export default ProfileTabs;
