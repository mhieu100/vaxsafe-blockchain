import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  SafetyCertificateFilled,
  ShoppingCartOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Button, Image, message, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useCartStore from '@/stores/useCartStore';
import { formatPrice } from '@/utils/formatPrice';
import { getImageProps } from '@/utils/imageUtils';

/**
 * VaccineCard component displays a vaccine in card format with grid view
 * @param {Object} props - Component props
 * @param {Object} props.vaccine - Vaccine data object
 * @returns {JSX.Element}
 */
const VaccineCard = ({ vaccine }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(vaccine, 1);
    message.success(t('vaccine.card.addToCartSuccess'));
  };

  const handleBooking = (e) => {
    e.stopPropagation();
    navigate(`/booking?slug=${vaccine.slug}`);
  };

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/vaccine/${vaccine.slug}`)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          {...getImageProps(vaccine.image, vaccine.name)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectFit: 'cover', height: '100%' }}
          preview={false}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {vaccine.stock > 0 ? (
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              In Stock
            </span>
          ) : (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Tooltip title={t('vaccine.card.addToWishlist')}>
            <button
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-white shadow-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation(); /* Add wishlist logic */
              }}
            >
              <HeartOutlined />
            </button>
          </Tooltip>
          <Tooltip title={t('vaccine.card.quickView')}>
            <button
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-blue-500 hover:bg-white shadow-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/vaccine/${vaccine.slug}`);
              }}
            >
              <EyeOutlined />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Country & Rating */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
            {vaccine.country}
          </span>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <StarFilled />
            <span>{vaccine.rating || 4.5}</span>
            <span className="text-slate-400 font-normal">({vaccine.reviews || 128})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {vaccine.name}
        </h3>

        {/* Blockchain Badge */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <SafetyCertificateFilled className="text-emerald-500" />
          <span>Blockchain Verified</span>
        </div>

        {/* Price & Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Price per dose</p>
              <p className="text-xl font-bold text-blue-600 leading-none">
                {formatPrice(vaccine.price)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={vaccine.stock === 0}
              className={`h-10 rounded-xl border-none font-medium shadow-sm transition-all hover:-translate-y-0.5 ${
                vaccine.stock === 0
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              Add
            </Button>
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={handleBooking}
              disabled={vaccine.stock === 0}
              className={`h-10 rounded-xl border-none font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 ${
                vaccine.stock === 0
                  ? 'bg-slate-300'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
              }`}
            >
              Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineCard;
