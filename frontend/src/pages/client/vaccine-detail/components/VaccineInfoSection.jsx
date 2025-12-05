import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  SafetyOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Image, InputNumber, message, Rate, Row, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';
import { formatPrice } from '@/utils/formatPrice';

const { Title, Text, Paragraph } = Typography;

const VaccineInfoSection = ({ vaccine }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  const vaccineImages = [
    vaccine?.image,
    'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-rotarix.jpg',
    'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-twinrix.jpg',
  ];

  const features = [
    t('vaccine.features.highQuality'),
    t('vaccine.features.fastShipping'),
    t('vaccine.features.returnPolicy'),
    t('vaccine.features.warranty'),
    t('vaccine.features.support'),
  ];

  const handleAddToCart = () => {
    addItem(vaccine, quantity);
    message.success(t('vaccine.addToCartSuccess'));
  };

  const handleBuyNow = () => {
    addItem(vaccine, quantity);
    navigate('/cart');
  };

  return (
    <Row gutter={[32, 32]}>
      <Col xs={24} lg={12}>
        <div className="sticky top-6">
          <div className="mb-4">
            <Image
              src={vaccineImages[selectedImage]}
              alt={vaccine.name}
              className="w-full rounded-xl"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {vaccineImages.map((img, index) => (
              <button
                type="button"
                key={img}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 p-0 w-full ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedImage(index)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(index)}
              >
                <img
                  src={img}
                  alt={`${vaccine.name} ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </Col>

      <Col xs={24} lg={12}>
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">{vaccine.country}</p>
            <Title level={1} className="mb-2">
              {vaccine.name}
            </Title>

            <div className="flex items-center gap-4 mb-4">
              <Rate disabled defaultValue={vaccine.rating || 4.5} />
              <Text type="secondary">
                ({vaccine.reviews || 128} {t('vaccine.reviews')})
              </Text>
              <Badge
                count={vaccine.stock > 0 ? t('vaccine.inStock') : t('vaccine.outOfStock')}
                style={{
                  backgroundColor: vaccine.stock > 0 ? '#52c41a' : '#ff4d4f',
                }}
              />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Title level={2} className="text-blue-600 m-0">
                {formatPrice(vaccine.price || 0)}
              </Title>
            </div>
          </div>

          <div>
            <Paragraph className="text-gray-600 text-base leading-relaxed">
              {vaccine.descriptionShort || t('vaccine.defaultDesc')}
            </Paragraph>
          </div>

          <div>
            <Title level={4}>{t('vaccine.keyFeatures')}</Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <Text>{feature}</Text>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-xl bg-gray-50">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Text strong>{t('vaccine.quantity')}:</Text>
                <InputNumber
                  min={1}
                  max={vaccine.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value ?? 1)}
                  className="w-24"
                />
                <Text type="secondary">
                  {vaccine.stock} {t('vaccine.available')}
                </Text>
              </div>

              <div className="flex gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={vaccine.stock === 0}
                  className="flex-1"
                >
                  {t('vaccine.addToCart')}
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  disabled={vaccine.stock === 0}
                  icon={<ClockCircleOutlined />}
                  className="flex-1 bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                >
                  {t('vaccine.bookingNow')}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button icon={<HeartOutlined />} className="flex-1">
                  {t('vaccine.addToWishlist')}
                </Button>
                <Button icon={<ShareAltOutlined />} className="flex-1">
                  {t('vaccine.share')}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TruckOutlined className="text-2xl text-blue-600 mb-2" />
              <Text strong className="block">
                {t('vaccine.freeShipping')}
              </Text>
              <Text type="secondary" className="text-sm">
                {t('vaccine.freeShippingDesc')}
              </Text>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <SafetyOutlined className="text-2xl text-green-600 mb-2" />
              <Text strong className="block">
                {t('vaccine.securePayment')}
              </Text>
              <Text type="secondary" className="text-sm">
                {t('vaccine.securePaymentDesc')}
              </Text>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <CheckCircleOutlined className="text-2xl text-orange-600 mb-2" />
              <Text strong className="block">
                {t('vaccine.easyReturns')}
              </Text>
              <Text type="secondary" className="text-sm">
                {t('vaccine.easyReturnsDesc')}
              </Text>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default VaccineInfoSection;
