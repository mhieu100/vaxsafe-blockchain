import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
  Tag,
  Typography,
} from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { useCenter } from '@/hooks/useCenter';
import { useFamilyMember } from '@/hooks/useFamilyMember';

const { Text, Title } = Typography;

const AppointmentSection = ({ bookingForm, vaccine, setCurrentStep, setBookingData }) => {
  const [_appointmentDate, setAppointmentDate] = useState(null);
  const [_appointmentTime, setAppointmentTime] = useState(null);
  const [_appointmentCenterId, setAppointmentCenterId] = useState(null);
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

  const disabledDate = (current) => {
    if (!current) return false;
    return current < dayjs().startOf('day');
  };

  const handleBookingNext = async () => {
    try {
      const values = await bookingForm.validateFields();

      if (setBookingData) {
        setBookingData((prev) => ({
          ...prev,
          appointmentDate: values.appointmentDate,
          appointmentTime: values.appointmentTime,
          appointmentCenter: values.appointmentCenter,
          bookingFor: values.bookingFor || 'self',
          familyMemberId: values.bookingFor === 'family' ? values.familyMemberId : null,
        }));
      }

      setCurrentStep(1);
    } catch (_error) {
      message.error('Please fill in all required fields');
    }
  };

  return (
    <div className="animate-fade-in">
      <Form form={bookingForm} layout="vertical">
        <Row gutter={32}>
          {/* Left Column: Booking Form */}
          <Col xs={24} lg={16}>
            {/* 1. Who is this for? */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserOutlined className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 m-0">Who is getting vaccinated?</h3>
              </div>

              <Form.Item name="bookingFor" initialValue="self" className="mb-0">
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
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${bookingFor === 'self' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <Radio value="self" className="hidden" />
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${bookingFor === 'self' ? 'border-blue-500' : 'border-slate-300'}`}
                      >
                        {bookingFor === 'self' && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Myself</div>
                        <div className="text-xs text-slate-500">Book for your own record</div>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${bookingFor === 'family' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <Radio value="family" className="hidden" />
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${bookingFor === 'family' ? 'border-blue-500' : 'border-slate-300'}`}
                      >
                        {bookingFor === 'family' && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Family Member</div>
                        <div className="text-xs text-slate-500">Child, parent, or dependent</div>
                      </div>
                    </label>
                  </div>
                </Radio.Group>
              </Form.Item>

              {bookingFor === 'family' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl animate-fade-in">
                  <Form.Item
                    label={
                      <span className="font-semibold text-slate-700">Select Family Member</span>
                    }
                    name="familyMemberId"
                    rules={[{ required: true, message: 'Please select a family member' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Select a family member"
                      size="large"
                      className="w-full"
                      options={families?.result?.map((member) => ({
                        value: member.id,
                        label: member.fullName,
                      }))}
                      onChange={(value) => {
                        if (setBookingData) {
                          setBookingData((prev) => ({ ...prev, familyMemberId: value }));
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              )}
            </div>

            {/* 2. Where and When? */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <EnvironmentOutlined className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 m-0">Location & Time</h3>
              </div>

              <Form.Item
                label={<span className="font-semibold text-slate-700">Vaccination Center</span>}
                name="appointmentCenter"
                rules={[{ required: true, message: 'Please select a center' }]}
              >
                <Select
                  size="large"
                  placeholder="Select a vaccination center near you"
                  showSearch
                  optionFilterProp="children"
                  className="w-full"
                  onChange={(value) => setAppointmentCenterId(value)}
                  options={centers?.result?.map((center) => ({
                    value: center.centerId,
                    label: center.name,
                  }))}
                />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span className="font-semibold text-slate-700">Date</span>}
                    name="appointmentDate"
                    rules={[{ required: true, message: 'Please select a date' }]}
                  >
                    <DatePicker
                      className="w-full"
                      size="large"
                      format="DD/MM/YYYY"
                      disabledDate={disabledDate}
                      onChange={(date) => setAppointmentDate(date)}
                      placeholder="Select date"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span className="font-semibold text-slate-700">Time Slot</span>}
                    name="appointmentTime"
                    rules={[{ required: true, message: 'Please select a time slot' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select time"
                      options={timeSlots}
                      onChange={(value) => setAppointmentTime(value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                size="large"
                onClick={handleBookingNext}
                className="h-12 px-8 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30"
              >
                Continue to Payment
              </Button>
            </div>
          </Col>

          {/* Right Column: Vaccine Summary */}
          <Col xs={24} lg={8}>
            {vaccine && (
              <div className="sticky top-24">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600" />

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={vaccine.image}
                        alt={vaccine.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                        {vaccine.name}
                      </h4>
                      <Tag color="blue">{vaccine.country}</Tag>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-sm">Doses Required</span>
                      <span className="font-bold text-slate-800">
                        {vaccine.dosesRequired} doses
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-sm">Interval</span>
                      <span className="font-bold text-slate-800">{vaccine.duration} days</span>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <InfoCircleOutlined className="text-blue-500" />
                      <span>Bring ID/Passport for verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <ClockCircleOutlined className="text-blue-500" />
                      <span>Arrive 15 mins before appointment</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AppointmentSection;
