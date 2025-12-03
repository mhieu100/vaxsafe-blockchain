import {
  BankOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Form, Radio } from 'antd';
import { useState } from 'react';

const PaymentSection = ({ paymentForm, setCurrentStep, setBookingData }) => {
  const [selectedMethod, setSelectedMethod] = useState('CASH');

  const paymentMethods = [
    {
      value: 'CASH',
      label: 'Cash Payment',
      icon: <WalletOutlined />,
      description: 'Pay directly at the center',
      color: 'blue',
    },
    {
      value: 'PAYPAL',
      label: 'PayPal',
      icon: <CreditCardOutlined />,
      description: 'Secure international payment',
      color: 'indigo',
    },
    {
      value: 'BANK',
      label: 'Bank Transfer',
      icon: <BankOutlined />,
      description: 'Direct bank transfer',
      color: 'emerald',
    },
    {
      value: 'METAMASK',
      label: 'MetaMask',
      icon: <SafetyCertificateOutlined />,
      description: 'Pay with Cryptocurrency',
      color: 'orange',
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
      // Validation failed
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose Payment Method</h2>
        <p className="text-slate-500 text-lg">
          Select how you would like to pay for your vaccination
        </p>
      </div>

      <Form form={paymentForm} layout="vertical">
        <Form.Item
          name="paymentMethod"
          rules={[{ required: true, message: 'Please select a payment method' }]}
          initialValue="CASH"
        >
          <Radio.Group
            className="w-full"
            onChange={(e) => {
              setSelectedMethod(e.target.value);
              setBookingData((prev) => ({
                ...prev,
                paymentMethod: e.target.value,
              }));
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`relative cursor-pointer group p-6 rounded-3xl border-2 transition-all duration-300 ${
                    selectedMethod === method.value
                      ? `border-${method.color}-500 bg-${method.color}-50/30 shadow-lg shadow-${method.color}-500/10`
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                  }`}
                >
                  <Radio value={method.value} className="hidden" />

                  {/* Check Icon */}
                  <div
                    className={`absolute top-6 right-6 transition-all duration-300 ${
                      selectedMethod === method.value
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-50'
                    }`}
                  >
                    <CheckCircleFilled className={`text-2xl text-${method.color}-500`} />
                  </div>

                  <div className="flex items-start gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
                        selectedMethod === method.value
                          ? `bg-${method.color}-500 text-white`
                          : `bg-slate-100 text-slate-500 group-hover:bg-${method.color}-100 group-hover:text-${method.color}-600`
                      }`}
                    >
                      {method.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-bold mb-1 transition-colors ${
                          selectedMethod === method.value ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {method.label}
                      </h3>
                      <p className="text-slate-500 text-sm m-0">{method.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      </Form>

      <div className="flex justify-between mt-12">
        <Button
          onClick={handlePaymentPrev}
          size="large"
          className="h-12 px-8 rounded-xl border-slate-200 hover:border-slate-300 hover:text-slate-600 font-medium"
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={handlePaymentNext}
          size="large"
          className="h-12 px-10 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30"
        >
          Review Booking
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;
