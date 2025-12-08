import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Image, message, Rate, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useCartStore from '@/stores/useCartStore';
import { formatPrice } from '@/utils/formatPrice';
import { getImageProps } from '@/utils/imageUtils';

const { Title, Text } = Typography;

const VaccineModeCard = ({ vaccine }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const handleAddToCart = (vaccine) => {
    addItem(vaccine, 1);
    message.success(t('vaccine.card.addToCartSuccess'));
  };

  return (
    <Card
      key={vaccine.id}
      className="w-full rounded-xl shadow-sm hover:shadow-md transition-shadow"
      styles={{
        body: {
          padding: '14px',
        },
      }}
    >
      <div className="flex gap-6">
        <button
          type="button"
          className="relative group cursor-pointer border-none bg-transparent p-0"
          onClick={() => navigate(`/vaccine/${vaccine.slug}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(`/vaccine/${vaccine.slug}`);
            }
          }}
        >
          <div className="w-32 h-32 relative">
            <Image
              {...getImageProps(vaccine.image, vaccine.name)}
              style={{ objectFit: 'cover' }}
              className="rounded-lg group-hover:scale-105 transition-transform"
            />
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <Title
              level={4}
              className="mb-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => navigate(`/vaccine/${vaccine.slug}`)}
              ellipsis={{ rows: 1 }}
            >
              {vaccine.name}
            </Title>
            <Button
              type="text"
              icon={<HeartOutlined />}
              className="text-gray-400 hover:text-red-500"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Tag color="blue" className="text-xs">
              {vaccine.country}
            </Tag>
            <Rate disabled defaultValue={vaccine.rating || 4} />
            <Text type="secondary" className="text-sm">
              ({vaccine.reviews || 128} {t('vaccine.card.reviews')})
            </Text>
          </div>

          <Text className="text-gray-600 mb-4 line-clamp-2">
            {vaccine.descriptionShort ||
              'High-quality vaccine with excellent features and performance.'}
          </Text>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Title level={3} className="text-blue-600 m-0">
                {formatPrice(vaccine.price)}
              </Title>
              <Badge
                count={vaccine.stock > 0 ? t('vaccine.card.inStock') : t('vaccine.card.outOfStock')}
                style={{
                  backgroundColor: vaccine.stock > 0 ? '#52c41a' : '#ff4d4f',
                }}
              />
            </div>
            <Space>
              <Button icon={<EyeOutlined />} onClick={() => navigate(`/vaccine/${vaccine.slug}`)}>
                {t('vaccine.card.view')}
              </Button>
              <Button
                type="primary"
                icon={<ClockCircleOutlined />}
                onClick={() => navigate(`/booking?slug=${vaccine.slug}`)}
                disabled={vaccine.stock === 0}
              >
                {t('vaccine.card.bookingNow')}
              </Button>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => handleAddToCart(vaccine)}
                disabled={vaccine.stock === 0}
              >
                {t('vaccine.card.addToCart')}
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VaccineModeCard;
