import { Tabs } from 'antd';
import VaccinationHistoryTab from './VaccinationHistoryTab';
import VaccinePassportTab from './VaccinePassportTab';
import VaccineRecordTab from './VaccineRecordTab';

const MyRecordsTab = () => {
  const items = [
    {
      key: 'history',
      label: 'Vaccination History',
      children: <VaccinationHistoryTab />,
    },
    {
      key: 'passport',
      label: 'Digital Passport',
      children: <VaccinePassportTab />,
    },
    {
      key: 'records',
      label: 'Medical Records',
      children: <VaccineRecordTab />,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <Tabs defaultActiveKey="history" items={items} type="card" />
    </div>
  );
};

export default MyRecordsTab;
