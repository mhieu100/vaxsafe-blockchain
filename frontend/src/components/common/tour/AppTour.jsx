import { Tour } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import modelImage from '@/assets/model.png';
import { completeTour } from '@/services/profile.service';
import useAccountStore from '@/stores/useAccountStore';

const TourContent = ({ title, description, onSkip }) => (
  <div className="flex gap-4">
    <div className="shrink-0">
      <img
        src={modelImage}
        alt="AI Assistant"
        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 p-0.5"
      />
    </div>
    <div className="flex flex-col">
      <div className="font-bold text-blue-600 mb-1">{title}</div>
      <div className="text-slate-600 text-sm mb-2">{description}</div>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-red-500 hover:text-slate-600 self-start hover:underline "
        >
          Bỏ qua hướng dẫn
        </button>
      )}
    </div>
  </div>
);

const AppTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openTour, setOpenTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { user, updateUserInfo } = useAccountStore();

  // Simulate loading delay similar to layout to ensure elements exist
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && !isLoading) {
      if (user?.isNewUser) {
        setOpenTour(true);
      }
    }
  }, [location.pathname, isLoading, user?.isNewUser]);

  const handleSkip = async () => {
    setOpenTour(false);
    // Call API to mark tour as seen
    try {
      await completeTour();
      // Update local store
      updateUserInfo({ isNewUser: false });
    } catch (error) {
      console.error('Failed to update tour status', error);
    }
  };

  const handleTourChange = (current) => {
    setCurrentStep(current);
    switch (current) {
      case 0:
      case 1:
        if (location.pathname !== '/') navigate('/');
        break;
      case 2:
      case 3:
        navigate('/vaccine');
        break;
      case 4:
        if (location.pathname !== '/vaccine') navigate('/vaccine');
        break;
      case 5:
        navigate('/cart');
        break;
      case 6:
        // Ensure we are on a page where chatbot is visible (usually all pages)
        break;
    }
  };

  const steps = [
    {
      title: 'Trợ lý ảo VaxSafe xin chào!',
      description: (
        <TourContent
          title="Chào mừng bạn mới!"
          description="Mình sẽ hướng dẫn bạn cách đặt lịch tiêm chủng nhanh chóng nhất nhé."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-logo'),
    },
    {
      title: 'Bước 1: Chọn Vắc xin',
      description: (
        <TourContent
          title="Danh mục vắc xin"
          description="Đầu tiên, hãy truy cập vào trang danh sách vắc xin của chúng tôi."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-menu-vaccine'),
    },
    {
      title: 'Bước 2: Tìm kiếm & Lọc',
      description: (
        <TourContent
          title="Bộ lọc thông minh"
          description="Sử dụng bộ lọc để tìm nhanh vắc xin theo giá, quốc gia hoặc tên gọi."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-vaccine-filter'),
      placement: 'right',
    },
    {
      title: 'Bước 3: Đặt lịch',
      description: (
        <TourContent
          title="Đặt lịch ngay"
          description="Nhấn nút 'Book' trên vắc xin bạn muốn để tiến hành đặt lịch hẹn."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-vaccine-book-btn'),
    },
    {
      title: 'Bước 4: Giỏ hàng',
      description: (
        <TourContent
          title="Kiểm tra giỏ hàng"
          description="Các mũi tiêm đã chọn sẽ nằm ở đây. Hãy kiểm tra lại trước khi thanh toán."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-cart'),
    },
    {
      title: 'Bước 5: Thanh toán',
      description: (
        <TourContent
          title="Hoàn tất đơn hàng"
          description="Xem lại tổng quan đơn hàng và tiến hành thanh toán an toàn."
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-cart-summary'),
    },
    {
      title: 'Tư vấn sức khỏe AI',
      description: (
        <TourContent
          title="Hỏi đáp mọi lúc"
          description="Nếu bạn cần tư vấn về loại vắc xin phù hợp hoặc thắc mắc về sức khỏe, hãy chat ngay với mình nhé!"
          onSkip={handleSkip}
        />
      ),
      target: () => document.getElementById('tour-chatbot'),
      placement: 'topRight',
    },
  ];

  if (!openTour) return null;

  return (
    <Tour
      open={openTour}
      onClose={handleSkip}
      steps={steps}
      current={currentStep}
      onChange={handleTourChange}
    />
  );
};

export default AppTour;
