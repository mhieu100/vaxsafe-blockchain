import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Image, message, Rate } from 'antd';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/useCartStore';
import { formatPrice } from '../../utils/formatPrice';
import { getImageProps } from '../../utils/imageUtils';

/**
 * VaccineCard component displays a vaccine in card format with grid view
 * @param {Object} props - Component props
 * @param {Object} props.vaccine - Vaccine data object
 * @returns {JSX.Element}
 */
const VaccineCard = ({ vaccine }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const handleAddToCart = (vaccine) => {
    addItem(vaccine, 1);
    message.success('Add vaccine to cart success');
  };

  return (
    <Card
      hoverable
      className="rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 group h-full flex flex-col"
      cover={
        <div className="relative overflow-hidden" style={{ height: '150px' }}>
          <Image
            {...getImageProps(vaccine.image, vaccine.name)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ objectFit: 'cover' }}
            preview={{
              mask: <EyeOutlined />,
              maskClassName: 'rounded-lg',
            }}
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/vaccine/${vaccine.slug}`)}
              title="Quick View"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-300 shadow-md hover:bg-blue-500 hover:border-blue-500 hover:text-white text-xs"
            />
            <Button
              icon={<HeartOutlined />}
              onClick={() => console.log('Add to wishlist')}
              title="Add to Wishlist"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-300 shadow-md hover:bg-red-500 hover:border-red-500 hover:text-white text-xs"
            />
          </div>
          {vaccine.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      }
      style={{
        padding: '6px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          padding: '10px',
        },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wide font-medium">{vaccine.country}</span>
        </div>

        <p className="mb-2 flex-grow font-bold">
          {vaccine.name.length > 20 ? `${vaccine.name.slice(0, 20)}...` : vaccine.name}
        </p>

        <div className="mb-3">
          <Rate disabled defaultValue={vaccine.rating || 4} className="text-sm" />
          <span className="ml-2 text-xs">({vaccine.reviews || 128})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 m-0">{formatPrice(vaccine.price)}</span>
          </div>
          <Badge
            count={vaccine.stock > 0 ? 'In Stock' : 'Out of Stock'}
            style={{
              backgroundColor: vaccine.stock > 0 ? '#52c41a' : '#ff4d4f',
              fontSize: '10px',
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(vaccine)}
            disabled={vaccine.stock === 0}
            className="w-full h-10 rounded-lg font-medium hover:-translate-y-0.5 transition-transform mt-auto"
          >
            {vaccine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          <Button
            type="primary"
            icon={<ClockCircleOutlined />}
            onClick={() => navigate(`/booking?slug=${vaccine.slug}`)}
            disabled={vaccine.stock === 0}
            className="w-full h-10 rounded-lg font-medium hover:-translate-y-0.5 transition-transform mt-auto"
          >
            {vaccine.stock === 0 ? 'Out of Stock' : 'Booking now'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VaccineCard;
