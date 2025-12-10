import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import VaccinationHistoryTab from './VaccinationHistoryTab';
import VaccinationProgressTab from './VaccinationProgressTab';
import VaccinePassportTab from './VaccinePassportTab';
import VaccineRecordTab from './VaccineRecordTab';

const MyRecordsTab = ({ editMode, setEditMode }) => {
  const { t } = useTranslation(['client']);
  const items = [
    {
      key: 'progress',
      label: t('client:myRecords.progress'),
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
      <Tabs defaultActiveKey="progress" items={items} type="card" />
    </div>
  );
};

export default MyRecordsTab;
