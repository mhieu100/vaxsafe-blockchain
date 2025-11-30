import { CalendarOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  message,
  Radio,
  Row,
  Select,
  Typography,
} from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { useCenter } from '@/hooks/useCenter';
import { useFamilyMember } from '@/hooks/useFamilyMember';

const { Text } = Typography;

const AppointmentSection = ({ bookingForm, vaccine, setCurrentStep, setBookingData }) => {
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [appointmentCenterId, setAppointmentCenterId] = useState(null);
  const [bookingFor, setBookingFor] = useState('self');

  const filter = {
    current: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { data: centers } = useCenter(filter);
  const { data: families } = useFamilyMember(filter);

  const timeSlots = useMemo(
    () => [
      { value: '07:00', label: '07:00 - 09:00' },
      { value: '09:00', label: '09:00 - 11:00' },
      { value: '11:00', label: '11:00 - 13:00' },
      { value: '13:00', label: '13:00 - 15:00' },
      { value: '15:00', label: '15:00 - 17:00' },
      { value: '17:00', label: '17:00 - 19:00' },
    ],
    []
  );

  // No automatic calculation - user just books one appointment at a time

  const disabledDate = (current) => {
    if (!current) return false;
    const isPast = current < dayjs().startOf('day');
    return isPast;
  };

  const handleBookingNext = async () => {
    try {
      await bookingForm.validateFields();
      setCurrentStep(1);
    } catch (_error) {
      message.error('Vui lòng điền đầy đủ thông tin');
    }
  };

  return (
    <Card title="Thông tin lịch hẹn" className="mb-8 shadow-md">
      <Form form={bookingForm} layout="vertical">
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            {vaccine && (
              <div className="mb-6">
                <Card
                  size="small"
                  className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-blue-500 rounded" />
                      <Text strong className="text-xl text-blue-800">
                        {vaccine.name}
                      </Text>
                    </div>
                    <div className="pl-4">
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="bg-white p-3 rounded-lg">
                            <Text type="secondary" className="text-xs">
                              Tổng số mũi
                            </Text>
                            <div className="flex items-baseline gap-1 mt-1">
                              <Text strong className="text-2xl text-blue-600">
                                {vaccine.dosesRequired}
                              </Text>
                              <Text type="secondary" className="text-sm">
                                mũi
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="bg-white p-3 rounded-lg">
                            <Text type="secondary" className="text-xs">
                              Khoảng cách
                            </Text>
                            <div className="flex items-baseline gap-1 mt-1">
                              <Text strong className="text-2xl text-blue-600">
                                {vaccine.duration}
                              </Text>
                              <Text type="secondary" className="text-sm">
                                ngày
                              </Text>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-blue-500 rounded" />
                  <Text strong className="text-base text-gray-700">
                    Thông tin lịch hẹn
                  </Text>
                </div>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn ngày</span>}
                    name="appointmentDate"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn ngày',
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-full"
                      locale={locale}
                      disabledDate={disabledDate}
                      onChange={(date) => setAppointmentDate(date)}
                      suffixIcon={<CalendarOutlined />}
                      placeholder="Chọn ngày tiêm"
                      size="large"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn khung giờ</span>}
                    name="appointmentTime"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn khung giờ',
                      },
                    ]}
                  >
                    <Select
                      options={timeSlots}
                      onChange={(value) => setAppointmentTime(value)}
                      size="large"
                      placeholder="Chọn khung giờ tiêm"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16} className="mt-4">
                <Col xs={24}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn địa điểm tiêm</span>}
                    name="appointmentCenter"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn địa điểm tiêm',
                      },
                    ]}
                  >
                    <Select
                      options={centers?.result?.map((center) => ({
                        value: center.centerId,
                        label: (
                          <div>
                            <div className="font-medium">{center.name}</div>
                          </div>
                        ),
                      }))}
                      onChange={(value) => setAppointmentCenterId(value)}
                      size="large"
                      placeholder="Chọn trung tâm tiêm chủng"
                      showSearch
                      filterOption={(input, option) => {
                        const center = centers?.result?.find((c) => c.centerId === option?.value);
                        return center?.name?.toLowerCase()?.includes(input.toLowerCase()) || false;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="mb-6">
              <Card
                size="small"
                className="bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-green-500 rounded" />
                    <Text strong className="text-xl text-green-800">
                      Đối tượng tiêm chủng
                    </Text>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
              <Form.Item
                label={<span className="font-semibold text-base">Đăng ký lịch cho</span>}
                name="bookingFor"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn đối tượng tiêm chủng',
                  },
                ]}
                initialValue="self"
              >
                <Radio.Group
                  onChange={(e) => {
                    const value = e.target.value;
                    setBookingFor(value);
                    if (setBookingData) {
                      setBookingData((prev) => ({
                        ...prev,
                        bookingFor: value,
                        familyMemberId: value === 'self' ? null : prev.familyMemberId,
                      }));
                    }
                  }}
                  className="w-full"
                  size="large"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Radio.Button value="self" className="w-full !h-auto !py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserOutlined className="text-2xl text-blue-500" />
                          <span className="font-medium">Bản thân</span>
                        </div>
                      </Radio.Button>
                    </Col>
                    <Col span={12}>
                      <Radio.Button value="family" className="w-full !h-auto !py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <TeamOutlined className="text-2xl text-green-500" />
                          <span className="font-medium">Người thân</span>
                        </div>
                      </Radio.Button>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>

              {bookingFor === 'family' && (
                <Form.Item
                  label={<span className="font-semibold text-sm">Chọn người thân</span>}
                  name="familyMemberId"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn người thân',
                    },
                  ]}
                  className="mt-4"
                >
                  <Select
                    placeholder="Chọn người thân cần tiêm chủng"
                    size="large"
                    options={families?.result?.map((member) => ({
                      value: member.id,
                      label: (
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                        </div>
                      ),
                    }))}
                    onChange={(value) => {
                      if (setBookingData) {
                        setBookingData((prev) => ({
                          ...prev,
                          familyMemberId: value,
                        }));
                      }
                    }}
                    showSearch
                  />
                </Form.Item>
              )}

              <Alert
                message={
                  bookingFor === 'self' ? (
                    <span className="text-sm">
                      Bạn đang đăng ký lịch tiêm cho <strong>bản thân</strong>
                    </span>
                  ) : (
                    <span className="text-sm">
                      Bạn đang đăng ký lịch tiêm cho <strong>người thân</strong>
                    </span>
                  )
                }
                type={bookingFor === 'self' ? 'info' : 'success'}
                className="mt-4 border-l-4 border-l-blue-500"
                showIcon={false}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Text strong className="text-blue-800 block mb-2">
                    Lưu ý quan trọng
                  </Text>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Vui lòng mang theo CMND/CCCD khi đến tiêm</li>
                    <li>• Đối với trẻ em: Mang theo giấy khai sinh hoặc sổ tiêm chủng</li>
                    <li>• Đến trước giờ hẹn 15 phút để làm thủ tục</li>
                    <li>• Liên hệ hotline nếu cần thay đổi hoặc hủy lịch hẹn</li>
                  </ul>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
      <div className="flex justify-end mt-8">
        <Button type="primary" onClick={handleBookingNext} className="px-8 rounded-lg">
          Tiếp tục thanh toán
        </Button>
      </div>
    </Card>
  );
};

export default AppointmentSection;
