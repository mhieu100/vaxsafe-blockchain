import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/useCartStore';
import { formatPrice } from '@/utils/formatPrice';

const CartItem = ({ item }) => {
  const { t } = useTranslation('common');
  const { removeItem, increase, decrease } = useCartStore();

  return (
    <Card key={item.vaccine.id} className="!mb-4 rounded-xl shadow-sm border-0">
      <div className="hidden sm:flex items-start">
        <img
          src={item.vaccine.image}
          alt={item.vaccine.name}
          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        />

        <div className="flex-1 ml-4">
          <span className="mb-2 font-semibold">{item.vaccine.name}</span>
          <span className="block mb-2 text-gray-600">{item.vaccine.country}</span>
          <span className="block mb-2 text-sm text-gray-600">
            {item.vaccine.descriptionShort?.slice(0, 50)}
          </span>
          <span className="text-lg font-semibold text-blue-600">
            {formatPrice(item.vaccine.price)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-3 ml-4">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeItem(item.vaccine.id)}
            size="small"
          >
            {t('cart.remove')}
          </Button>

          <Space align="center">
            <span>{t('cart.qty')}:</span>
            <MinusCircleOutlined
              onClick={() => decrease(item.vaccine.id)}
              className="cursor-pointer text-lg hover:text-blue-600"
            />
            <span className="px-2 font-semibold">{item.quantity}</span>
            <PlusCircleOutlined
              onClick={() => increase(item.vaccine.id)}
              className="cursor-pointer text-lg hover:text-blue-600"
            />
          </Space>

          <span className="text-lg font-semibold text-blue-600">
            {formatPrice(item.vaccine.price * item.quantity)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
