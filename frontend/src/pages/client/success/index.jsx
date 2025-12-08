import { CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTransactionResult } from '@/services/payment.service';

const SuccessPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const paymentId = searchParams.get('payment');

  useEffect(() => {
    const fetchResult = async () => {
      if (!paymentId) return;
      try {
        const data = await getTransactionResult(paymentId);
        setResult(data);
      } catch (error) {
        console.error('Failed to fetch transaction result:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="rounded-2xl shadow-xl">
          <Result
            status="success"
            icon={<CheckCircleOutlined className="text-green-600" />}
            title="Thanh toán thành công!"
            subTitle={
              loading ? (
                'Đang tải thông tin...'
              ) : (
                <div className="space-y-2 text-slate-600">
                  <p className="text-lg">
                    Cảm ơn{' '}
                    <span className="font-semibold text-slate-800">{result?.patientName}</span>!
                  </p>
                  {result && (
                    <>
                      <p>
                        Bạn đã đặt lịch tiêm{' '}
                        <span className="font-semibold text-blue-600">{result.vaccineName}</span>{' '}
                        thành công.
                      </p>
                      <p>
                        Thời gian:{' '}
                        <span className="font-semibold">
                          {result.scheduledTime} - {result.scheduledDate}
                        </span>
                      </p>
                      <p>
                        Địa điểm: <span className="font-semibold">{result.centerName}</span>
                      </p>
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <MailOutlined className="mr-2 text-green-600" />
                        <span>
                          Email xác nhận lịch hẹn và hóa đơn đã được gửi đến:{' '}
                          <span className="font-semibold text-green-700">{result.emailSentTo}</span>
                        </span>
                      </div>
                    </>
                  )}
                  <p className="mt-4 text-sm text-slate-500">
                    Vui lòng kiểm tra email để xem chi tiết. Bạn sẽ được chuyển hướng sau giây
                    lát...
                  </p>
                </div>
              )
            }
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
