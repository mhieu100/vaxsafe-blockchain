import { Row } from 'antd';
import { useCartStore } from '@/stores/useCartStore';
import EmptyCart from './components/EmptyCart';
import ListItemSection from './components/ListItemSection';
import SummarySection from './components/SummarySection';
import TopCartSection from './components/TopCartSection';

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
