import {
  CalendarOutlined,
  HeartOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
import TabEditUser from '@/components/tab/TabEditUser';
import AppointmentScheduleTab from './AppointmentScheduleTab';
import FamilyManagerTab from './FamilyManagerTab';
import HealthRemindersTab from './HealthRemindersTab';
import VaccinationHistoryTab from './VaccinationHistoryTab';
import VaccinePassportTab from './VaccinePassportTab';

const { Title } = Typography;

const ProfileTabs = ({ activeTab, editMode, setEditMode }) => {
  const tabConfig = {
    1: {
      title: 'Health Profile',
      icon: <UserOutlined className="text-xl" />,
      content: <TabEditUser editMode={editMode} setEditMode={setEditMode} />,
    },
    2: {
      title: 'Vaccination History',
      icon: <HistoryOutlined className="text-xl" />,
      content: <VaccinationHistoryTab />,
    },
    3: {
      title: 'Appointments',
      icon: <CalendarOutlined className="text-xl" />,
      content: <AppointmentScheduleTab />,
    },
    4: {
      title: 'Health Reminders',
      icon: <HeartOutlined className="text-xl" />,
      content: <HealthRemindersTab />,
    },
    5: {
      title: 'Family Manager',
      icon: <TeamOutlined className="text-xl" />,
      content: <FamilyManagerTab />,
    },
    6: {
      title: 'Vaccine Passport',
      icon: <SafetyCertificateOutlined className="text-xl" />,
      content: <VaccinePassportTab />,
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig['1'];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white">
            {currentTab.icon}
          </div>
          <Title level={3} className="!mb-0 !text-gray-800">
            {currentTab.title}
          </Title>
        </div>
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">{currentTab.content}</div>
    </div>
  );
};

export default ProfileTabs;
