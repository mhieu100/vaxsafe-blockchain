import { formatPrice } from '@/utils/formatPrice';
import { Button, Card, Col, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCartStore } from '@/stores/useCartStore';

const SummarySection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAccountStore();
  const { totalQuantity, totalPrice } = useCartStore();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  const shipping = totalPrice() > 1000000 ? 0 : 100000;
  const tax = totalPrice() * 0.1;
  const total = totalPrice() + shipping + tax;

  return (
    <Col xs={24} lg={8}>
      <Card
        title={t('cart.orderSummary')}
        className="hidden sm:block rounded-xl sticky top-6 shadow-sm border-0"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {t('cart.subtotal')} ({totalQuantity()} {t('cart.items')})
            </span>
            <span className="font-medium">{formatPrice(totalPrice())}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('cart.shipping')}</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600">{t('cart.free')}</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('cart.tax')} (10%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>

          {totalPrice() > 1000000 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <span className="text-green-700 text-sm">
                🎉 {t('cart.savedShipping')}
              </span>
            </div>
          )}

          <Divider className="my-4" />

          <div className="flex justify-between items-center">
            <span className="mb-0 text-lg font-semibold">
              {t('cart.total')}
            </span>
            <span className="text-blue-600 mb-0 text-xl font-bold">
              {formatPrice(total)}
            </span>
          </div>

          <Button
            type="primary"
            onClick={handleCheckout}
            className="w-full h-12 text-base font-semibold rounded-lg mt-4"
          >
            {t('cart.proceedCheckout')}
          </Button>

          <div className="text-center mt-3">
            <span className="text-sm text-gray-500">
              🔒 {t('cart.secureCheckout')}
            </span>
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default SummarySection;
