import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CancelPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="rounded-2xl shadow-xl">
          <Result
            status="error"
            icon={<CloseCircleOutlined className="text-red-600" />}
            title="Payment Cancelled"
            subTitle="Thanh toán đã bị hủy. Đơn hàng của bạn chưa được xác nhận. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác."
            extra={[
              <Button type="primary" key="cart" onClick={() => navigate('/cart')} size="large">
                Quay lại giỏ hàng
              </Button>,
              <Button key="checkout" onClick={() => navigate('/checkout')} size="large">
                Thử lại thanh toán
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

export default CancelPage;
