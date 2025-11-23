import { ShoppingOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EmptyCart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-16">
          <Empty
            image={
              <ShoppingOutlined className="text-4xl sm:text-6xl text-gray-300" />
            }
            description={
              <div>
                <span className="text-lg sm:text-xl text-gray-600 block mb-2">
                  {t('cart.empty')}
                </span>
                <span className="text-sm sm:text-base">
                  {t('cart.emptyDesc')}
                </span>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/vaccine')}
              className="mt-4 h-12 px-8 text-base font-medium"
            >
              {t('cart.startShopping')}
            </Button>
          </Empty>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
