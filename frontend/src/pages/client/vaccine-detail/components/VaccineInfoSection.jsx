import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Badge, Button, Col, Image, InputNumber, message, Row, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getGroupedBookingHistory } from '@/services/booking.service';
import { useCartStore } from '@/stores/useCartStore';
import { formatPrice } from '@/utils/formatPrice';

const { Title, Text, Paragraph } = Typography;

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center h-full hover:shadow-md transition-shadow">
    <div className="text-blue-500 text-xl mb-2 bg-white p-2 rounded-full shadow-sm">{icon}</div>
    <Text type="secondary" className="text-xs uppercase tracking-wider mb-1">
      {label}
    </Text>
    <Text strong className="text-sm line-clamp-2 leading-tight">
      {value || 'N/A'}
    </Text>
  </div>
);

const VaccineInfoSection = ({ vaccine }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  const vaccineImages = [vaccine?.image].filter(Boolean);

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

  const handleBuyNow = async () => {
    try {
      const res = await getGroupedBookingHistory();
      if (res?.data) {
        const route = res.data.find((r) => r.vaccineSlug === vaccine.slug);
        if (route) {
          const hasActive = route.appointments.some((a) =>
            ['PENDING', 'SCHEDULED', 'RESCHEDULE'].includes(a.appointmentStatus)
          );
          if (hasActive) {
            message.warning(
              t('vaccine.activeBookingWarning') || 'Bạn đang có lịch hẹn cho vắc xin này'
            );
            return;
          }
        }
      }
      navigate(`/booking?slug=${vaccine.slug}`);
    } catch (error) {
      console.error(error);
      navigate(`/booking?slug=${vaccine.slug}`);
    }
  };

  return (
    <Row gutter={[48, 32]}>
      <Col xs={24} lg={12}>
        <div className="sticky top-24">
          <div className="mb-4 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
            <Image
              src={vaccineImages[selectedImage]}
              alt={vaccine.name}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            {vaccine.stock === 0 && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
                <span className="text-white font-bold text-3xl uppercase tracking-widest border-4 border-white p-4 -rotate-12">
                  {t('vaccine.outOfStock')}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {vaccineImages.map((img, index) => (
              <button
                type="button"
                key={img}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 p-1 transition-all ${
                  selectedImage === index
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-transparent hover:border-slate-200'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={img}
                  alt={`${vaccine.name} ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>
      </Col>

      <Col xs={24} lg={12}>
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 font-medium">
                {vaccine.country}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge status={vaccine.stock > 0 ? 'success' : 'error'} />
                <Text strong className={vaccine.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {vaccine.stock > 0 ? t('vaccine.inStock') : t('vaccine.outOfStock')}
                </Text>
              </div>
            </div>

            <Title level={1} className="mb-4 text-slate-800 leading-tight">
              {vaccine.name}
            </Title>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(vaccine.price || 0)}
              </span>
              <span className="text-slate-400 text-lg">/ {t('vaccine.dose')}</span>
            </div>

            <Paragraph className="text-slate-600 text-lg leading-relaxed mb-6">
              {vaccine.descriptionShort}
            </Paragraph>
          </div>

          {/* Info Grid Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <InfoCard
              icon={<BankOutlined />}
              label={t('vaccine.manufacturer')}
              value={vaccine.manufacturer}
            />
            <InfoCard
              icon={<GlobalOutlined />}
              label={t('vaccine.origin')}
              value={vaccine.country}
            />
            <InfoCard
              icon={<MedicineBoxOutlined />}
              label={t('vaccine.dosesRequired')}
              value={`${vaccine.dosesRequired || 1} ${t('vaccine.doses')}`}
            />
            <InfoCard
              icon={<CalendarOutlined />}
              label={t('vaccine.daysForNextDose')}
              value={vaccine.daysForNextDose ? `${vaccine.daysForNextDose} ${t('days')}` : 'N/A'}
            />
          </div>

          {/* Action Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <Text className="block text-slate-500 mb-2 font-medium">
                  {t('vaccine.selectQuantity')}
                </Text>
                <InputNumber
                  min={1}
                  max={Math.min(vaccine.stock, 10)}
                  value={quantity}
                  onChange={(value) => setQuantity(value ?? 1)}
                  size="large"
                  className="w-full !rounded-xl"
                />
              </div>
              <div className="flex-1 text-right">
                <Text type="secondary" className="text-sm">
                  {t('vaccine.totalEstimate')}
                </Text>
                <div className="text-2xl font-bold text-slate-800">
                  {formatPrice((vaccine.price || 0) * quantity)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="large"
                type="primary"
                onClick={handleBuyNow}
                disabled={vaccine.stock === 0}
                icon={<ClockCircleOutlined />}
                className="flex-1 h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                {t('vaccine.bookingNow')}
              </Button>
              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={vaccine.stock === 0}
                className="flex-1 h-12 text-base font-medium rounded-xl border-blue-200 text-blue-600 hover:border-blue-600 hover:bg-blue-50"
              >
                {t('vaccine.addToCart')}
              </Button>
            </div>
          </div>

          {/* Features & Share */}
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-6">
            {features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-auto">
            <Button
              type="text"
              icon={<HeartOutlined />}
              className="text-slate-500 hover:text-red-500 hover:bg-red-50"
            >
              {t('vaccine.addToWishlist')}
            </Button>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              className="text-slate-500 hover:text-blue-500 hover:bg-blue-50"
            >
              {t('vaccine.share')}
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default VaccineInfoSection;
