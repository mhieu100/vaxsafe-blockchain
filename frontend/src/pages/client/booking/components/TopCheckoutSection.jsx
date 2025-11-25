import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Button, Card, Steps } from 'antd';
import { useNavigate } from 'react-router-dom';

const TopCheckoutSection = ({ currentStep, setCurrentStep }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <span className="font-semibold text-2xl mb-0">Tạo lịch đặt tiêm</span>
          <span className="flex items-center gap-1 text-blue-400">
            <LockOutlined /> SSL Encrypted & Secure
          </span>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className="rounded-lg">
          Hủy đặt lịch
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm border-0">
        <Steps
          current={currentStep}
          onChange={(value) => setCurrentStep(value)}
          className="checkout-steps"
          items={[
            {
              title: 'Lịch hẹn',
              icon: <CalendarOutlined />,
              description: 'Thông tin đặt lịch',
            },
            {
              title: 'Thanh toán',
              icon: <CreditCardOutlined />,
              description: 'Phương thức thanh toán',
            },
            {
              title: 'Xem lại',
              icon: <CheckCircleOutlined />,
              description: 'Xác nhận đặt lịch',
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default TopCheckoutSection;
