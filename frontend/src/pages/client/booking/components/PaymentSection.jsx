import {
  BankOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Form, Radio } from 'antd';
import { useState } from 'react';

const METHOD_THEMES = {
  CASH: {
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50/30',
    activeShadow: 'shadow-blue-500/10',
    checkColor: 'text-blue-500',
    iconActiveBg: 'bg-blue-500',
    iconHoverBg: 'group-hover:bg-blue-100',
    iconHoverText: 'group-hover:text-blue-600',
  },
  PAYPAL: {
    activeBorder: 'border-indigo-500',
    activeBg: 'bg-indigo-50/30',
    activeShadow: 'shadow-indigo-500/10',
    checkColor: 'text-indigo-500',
    iconActiveBg: 'bg-indigo-500',
    iconHoverBg: 'group-hover:bg-indigo-100',
    iconHoverText: 'group-hover:text-indigo-600',
  },
  BANK: {
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50/30',
    activeShadow: 'shadow-emerald-500/10',
    checkColor: 'text-emerald-500',
    iconActiveBg: 'bg-emerald-500',
    iconHoverBg: 'group-hover:bg-emerald-100',
    iconHoverText: 'group-hover:text-emerald-600',
  },
  METAMASK: {
    activeBorder: 'border-orange-500',
    activeBg: 'bg-orange-50/30',
    activeShadow: 'shadow-orange-500/10',
    checkColor: 'text-orange-500',
    iconActiveBg: 'bg-orange-500',
    iconHoverBg: 'group-hover:bg-orange-100',
    iconHoverText: 'group-hover:text-orange-600',
  },
};

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
    } catch {}
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
              {paymentMethods.map((method) => {
                const theme = METHOD_THEMES[method.value];
                const isSelected = selectedMethod === method.value;

                return (
                  <label
                    key={method.value}
                    className={`relative cursor-pointer group p-6 rounded-3xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `${theme.activeBorder} ${theme.activeBg} shadow-lg ${theme.activeShadow}`
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <Radio value={method.value} className="hidden" />

                    {/* Checkmark */}
                    <div
                      className={`absolute top-6 right-6 transition-all duration-300 ${
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                    >
                      <CheckCircleFilled className={`text-2xl ${theme.checkColor}`} />
                    </div>

                    <div className="flex items-start gap-5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
                          isSelected
                            ? `${theme.iconActiveBg} text-white`
                            : `bg-slate-100 text-slate-500 ${theme.iconHoverBg} ${theme.iconHoverText}`
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold mb-1 transition-colors ${
                            isSelected ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {method.label}
                        </h3>
                        <p className="text-slate-500 text-sm m-0">{method.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
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
