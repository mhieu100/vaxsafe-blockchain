import { Row } from 'antd';
import EmptyCart from '../../components/cart/EmptyCart';
import ListItemSection from '../../components/cart/ListItemSection';
import SummarySection from '../../components/cart/SummarySection';
import TopCartSection from '../../components/cart/TopCartSection';
import { useCartStore } from '../../stores/useCartStore';

const CartPage = () => {
  const { items } = useCartStore();

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <TopCartSection />
        <Row gutter={[16, 16]}>
          <ListItemSection />
          <SummarySection />
        </Row>
      </div>
    </div>
  );
};

export default CartPage;
