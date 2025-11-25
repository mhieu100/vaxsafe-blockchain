import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="rounded-2xl shadow-xl">
          <Result
            status="success"
            icon={<CheckCircleOutlined className="text-green-600" />}
            title="Payment Successful!"
            subTitle="Thanh toán thành công! Đơn hàng của bạn đã được xác nhận và đang được xử lý. Bạn sẽ được chuyển hướng đến trang hồ sơ sau 5 giây."
            extra={[
              <Button
                type="primary"
                key="profile"
                onClick={() => navigate('/profile')}
                size="large"
              >
                Xem hồ sơ
              </Button>,
              <Button key="home" onClick={() => navigate('/')} size="large">
                {t('header.home')}
              </Button>,
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
