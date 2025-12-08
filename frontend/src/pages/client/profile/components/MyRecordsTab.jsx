import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import EditProfileTab from './EditProfileTab';
import VaccinationHistoryTab from './VaccinationHistoryTab';
import VaccinationProgressTab from './VaccinationProgressTab';
import VaccinePassportTab from './VaccinePassportTab';
import VaccineRecordTab from './VaccineRecordTab';

const MyRecordsTab = ({ editMode, setEditMode }) => {
  const { t } = useTranslation(['client']);
  const items = [
    {
      key: 'info',
      label: t('client:settings.profileInfo'),
      children: <EditProfileTab editMode={editMode} setEditMode={setEditMode} />,
    },
    {
      key: 'progress',
      label: 'Tiến độ',
      children: <VaccinationProgressTab />,
    },
    {
      key: 'history',
      label: t('client:myRecords.vaccinationHistory'),
      children: <VaccinationHistoryTab />,
    },
    {
      key: 'passport',
      label: t('client:myRecords.digitalPassport'),
      children: <VaccinePassportTab />,
    },
    {
      key: 'records',
      label: t('client:myRecords.medicalRecords'),
      children: <VaccineRecordTab />,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <Tabs defaultActiveKey="info" items={items} type="card" />
    </div>
  );
};

export default MyRecordsTab;
