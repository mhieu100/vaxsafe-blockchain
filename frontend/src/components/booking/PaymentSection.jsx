import { Card, Form, Radio, Button, Alert } from 'antd';
import {
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const PaymentSection = ({ paymentForm, setCurrentStep, setBookingData }) => {
  const paymentMethods = [
    {
      value: 'CASH',
      label: 'Tiền mặt',
      icon: <WalletOutlined />,
      description: 'Thanh toán tiền mặt khi đến tiêm',
    },
    {
      value: 'PAYPAL',
      label: 'PayPal',
      icon: <CreditCardOutlined />,
      description: 'Thanh toán qua PayPal',
    },
    {
      value: 'BANK',
      label: 'Chuyển khoản',
      icon: <BankOutlined />,
      description: 'Chuyển khoản ngân hàng',
    },
    {
      value: 'METAMASK',
      label: 'MetaMask',
      icon: <WalletOutlined />,
      description: 'Thanh toán bằng ví điện tử',
    },
  ];

  const handlePaymentPrev = () => {
    setCurrentStep(0);
  };

  const handlePaymentNext = async () => {
    try {
      await paymentForm.validateFields();
      setCurrentStep(2);
    } catch {
      // Validation failed, do nothing
    }
  };

  return (
    <Card title="Phương thức thanh toán" className="mb-8 shadow-md">
      <Alert
        message="Chọn phương thức thanh toán"
        description="Vui lòng chọn phương thức thanh toán phù hợp với bạn"
        type="info"
        className="mb-6"
        showIcon
      />

      <Form form={paymentForm} layout="vertical">
        <Form.Item
          name="paymentMethod"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn phương thức thanh toán',
            },
          ]}
          initialValue="CASH"
        >
          <Radio.Group 
            className="w-full"
            onChange={(e) => {
              /* eslint-disable no-console */
              console.log('💳 Payment method changed to:', e.target.value);
              /* eslint-enable no-console */
              setBookingData(prev => ({
                ...prev,
                paymentMethod: e.target.value
              }));
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <Card
                  key={method.value}
                  className="cursor-pointer hover:shadow-lg transition-all"
                >
                  <Radio value={method.value} className="w-full">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl text-blue-500">{method.icon}</div>
                      <div>
                        <div className="font-semibold text-base">
                          {method.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </Radio>
                </Card>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      </Form>

      <div className="flex justify-between mt-8">
        <Button onClick={handlePaymentPrev} className="px-8 rounded-lg">
          Quay lại
        </Button>
        <Button
          type="primary"
          onClick={handlePaymentNext}
          className="px-8 rounded-lg"
        >
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};

export default PaymentSection;
