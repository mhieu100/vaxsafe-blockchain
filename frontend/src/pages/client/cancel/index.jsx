import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTransactionResult } from '@/services/payment.service';

const CancelPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);

  const paymentId = searchParams.get('payment');

  useEffect(() => {
    const fetchResult = async () => {
      if (!paymentId) return;
      try {
        const data = await getTransactionResult(paymentId);
        setResult(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchResult();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="rounded-2xl shadow-xl">
          <Result
            status="error"
            icon={<CloseCircleOutlined className="text-red-600" />}
            title="Thanh toán bị hủy"
            subTitle={
              <div className="space-y-2">
                <p>Giao dịch đã bị hủy hoặc không thành công.</p>
                {result && (
                  <p className="text-slate-600">
                    Lịch đặt tiêm <span className="font-semibold">{result.vaccineName}</span> của
                    bạn chưa được hoàn tất. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                  </p>
                )}
              </div>
            }
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
