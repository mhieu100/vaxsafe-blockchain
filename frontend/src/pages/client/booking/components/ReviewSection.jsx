import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Descriptions, Divider, Image, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { useCenter } from '@/hooks/useCenter';
import { useFamilyMember } from '@/hooks/useFamilyMember';

const { Title, Text } = Typography;

const ReviewSection = ({ bookingData, vaccine, setCurrentStep, handleBookingSubmit, loading }) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const filter = {
    current: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { data: centers } = useCenter(filter);
  const { data: families } = useFamilyMember(filter);

  const doseSchedules = bookingData.doseSchedules || [];
  const vaccineInfo = vaccine;
  const paymentMethod = bookingData.paymentMethod || 'CASH';

  // Calculate total price
  const calculateTotal = () => {
    if (!vaccineInfo?.price || !doseSchedules.length) return 0;
    return vaccineInfo.price * doseSchedules.length;
  };

  const totalPrice = calculateTotal();

  // Helper function to get center info by ID
  const getCenterById = (centerId) => {
    return centers?.result?.find((center) => String(center.centerId) === String(centerId));
  };

  // Helper function to get family member info by ID
  const getFamilyMemberById = (memberId) => {
    return families?.result?.find((member) => member.id === memberId);
  };

  const handleReviewPrev = () => {
    setCurrentStep(1);
  };

  const handleConfirm = async () => {
    if (!acceptTerms || !acceptPolicy) {
      return;
    }
    await handleBookingSubmit();
  };

  return (
    <Card title="Xác nhận đặt lịch" className="mb-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <CheckCircleOutlined className="text-purple-600" />
        </div>
        <Title level={3} className="mb-0">
          Xem lại thông tin đặt lịch
        </Title>
      </div>

      <Alert
        message="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận"
        description="Sau khi xác nhận, bạn sẽ nhận được email xác nhận đặt lịch"
        type="info"
        className="mb-6"
        showIcon
      />

      {/* Vaccine Information */}
      {vaccineInfo && (
        <Card
          className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300"
          size="small"
        >
          <Title level={5} className="text-blue-800 mb-4">
            🔬 Thông tin vaccine
          </Title>
          <div className="flex flex-col md:flex-row items-start gap-4">
            {vaccineInfo.image && (
              <div className="flex-shrink-0">
                <Image
                  src={vaccineInfo.image}
                  alt={vaccineInfo.name}
                  className="w-20 h-20 object-cover rounded-xl border-2 border-blue-300"
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xnG4W+Q2yCQYRqEAjQBJ9BW2XjeAhMBAh4iI3P/k="
                />
              </div>
            )}

            <div className="flex-1">
              <Text strong className="block text-xl text-blue-800 mb-2">
                {vaccineInfo.name}
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <Text className="text-xs text-gray-500 block">🌍 Xuất xứ</Text>
                  <Text strong className="text-sm">
                    {vaccineInfo.country}
                  </Text>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <Text className="text-xs text-gray-500 block">💉 Số mũi tiêm</Text>
                  <Text strong className="text-sm">
                    {vaccineInfo.dosesRequired} mũi
                  </Text>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <Text className="text-xs text-gray-500 block">📅 Khoảng cách</Text>
                  <Text strong className="text-sm">
                    {vaccineInfo.duration} ngày
                  </Text>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <Text className="text-xs text-gray-500 block">💰 Giá/mũi</Text>
                  <Text strong className="text-sm text-green-600">
                    {vaccineInfo.price?.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Booking Information */}
      <Card className="mb-6" size="small">
        <Title level={5} className="mb-4">
          📋 Thông tin đặt lịch
        </Title>
        <Descriptions column={1} bordered>
          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-2" />
                Đặt lịch cho
              </span>
            }
          >
            <Tag color={bookingData.bookingFor === 'self' ? 'blue' : 'green'}>
              {bookingData.bookingFor === 'self' ? 'Bản thân' : 'Người thân'}
            </Tag>
            {bookingData.bookingFor === 'family' && bookingData.familyMemberId && (
              <span className="ml-2">
                {getFamilyMemberById(bookingData.familyMemberId)?.fullName ||
                  `ID: ${bookingData.familyMemberId}`}
              </span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Dose Schedules */}
      {doseSchedules && doseSchedules.length > 0 && (
        <div className="mb-6">
          <Title level={5} className="mb-4">
            💉 Lịch tiêm chi tiết ({doseSchedules.length} mũi)
          </Title>
          <div className="space-y-4">
            {doseSchedules.map((dose, index) => {
              const center = getCenterById(dose.centerId);
              return (
                <Card
                  // biome-ignore lint/suspicious/noArrayIndexKey: List is static
                  key={index}
                  size="small"
                  className={`${
                    index === 0 ? 'border-2 border-blue-400 bg-blue-50' : 'border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <CalendarOutlined />
                            <span>Ngày tiêm</span>
                          </div>
                          <div className="font-semibold">
                            {dose.date ? dayjs(dose.date).format('DD/MM/YYYY') : 'Chưa xác định'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <ClockCircleOutlined />
                            <span>Giờ tiêm</span>
                          </div>
                          <div className="font-semibold">{dose.time || 'Chưa xác định'}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <EnvironmentOutlined />
                            <span>Địa điểm</span>
                          </div>
                          <div className="font-semibold">
                            {center?.name || `ID: ${dose.centerId}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <Card className="mb-6" size="small">
        <Title level={5} className="mb-4">
          💳 Thông tin thanh toán
        </Title>
        <Descriptions column={1} bordered>
          <Descriptions.Item
            label={
              <span>
                <DollarOutlined className="mr-2" />
                Phương thức thanh toán
              </span>
            }
          >
            <Tag color="blue">
              {paymentMethod === 'CASH'
                ? 'Tiền mặt'
                : paymentMethod === 'PAYPAL'
                  ? 'PayPal'
                  : paymentMethod === 'BANK'
                    ? 'Chuyển khoản'
                    : paymentMethod === 'METAMASK'
                      ? 'MetaMask'
                      : paymentMethod}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Giá vaccine / mũi">
            <span className="text-base">
              {vaccineInfo?.price?.toLocaleString('vi-VN') || '0'} VNĐ
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số mũi tiêm">
            <span className="text-base font-semibold">{doseSchedules.length} mũi</span>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <span className="text-lg font-bold text-blue-600">
              {totalPrice.toLocaleString('vi-VN')} VNĐ
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      {/* Terms and Conditions */}
      <div className="mb-6">
        <div className="space-y-3">
          <Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}>
            <span className="text-sm">
              Tôi đã đọc và đồng ý với{' '}
              <a href="/terms" className="text-blue-600">
                Điều khoản sử dụng dịch vụ
              </a>
            </span>
          </Checkbox>
          <Checkbox checked={acceptPolicy} onChange={(e) => setAcceptPolicy(e.target.checked)}>
            <span className="text-sm">
              Tôi đã đọc và đồng ý với{' '}
              <a href="/privacy" className="text-blue-600">
                Chính sách bảo mật thông tin
              </a>
            </span>
          </Checkbox>
        </div>
      </div>

      {(!acceptTerms || !acceptPolicy) && (
        <Alert
          message="Vui lòng đồng ý với các điều khoản và chính sách"
          type="warning"
          className="mb-6"
          showIcon
        />
      )}

      <div className="flex justify-between mt-8">
        <Button onClick={handleReviewPrev} className="px-8 rounded-lg">
          Quay lại
        </Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          disabled={!acceptTerms || !acceptPolicy}
          loading={loading}
          className="px-8 rounded-lg"
        >
          Xác nhận đặt lịch
        </Button>
      </div>
    </Card>
  );
};

export default ReviewSection;
