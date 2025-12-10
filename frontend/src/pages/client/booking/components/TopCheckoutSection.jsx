import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  SafetyCertificateFilled,
} from '@ant-design/icons';
import { Button, Steps } from 'antd';
import { useNavigate } from 'react-router-dom';

const TopCheckoutSection = ({ currentStep, doseNumber }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-10">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Appointment</h1>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <SafetyCertificateFilled />
            <span className="text-xs font-bold uppercase tracking-wider">
              Secure Blockchain Transaction
            </span>
          </div>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className="rounded-full border-slate-200 hover:border-red-500 hover:text-red-500 transition-colors"
        >
          Cancel Booking
        </Button>
      </div>

      {}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <Steps
          current={currentStep}
          className="premium-steps"
          items={[
            {
              title: doseNumber ? `Appointment (Dose ${doseNumber})` : 'Appointment',
              description: 'Choose date & center',
              icon: <CalendarOutlined className={currentStep >= 0 ? 'text-blue-600' : ''} />,
            },
            {
              title: 'Payment',
              description: 'Select method',
              icon: <CreditCardOutlined className={currentStep >= 1 ? 'text-blue-600' : ''} />,
            },
            {
              title: 'Review',
              description: 'Confirm details',
              icon: <CheckCircleOutlined className={currentStep >= 2 ? 'text-blue-600' : ''} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TopCheckoutSection;
