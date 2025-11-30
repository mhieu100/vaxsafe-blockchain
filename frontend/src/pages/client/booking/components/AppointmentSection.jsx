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
  const [doseForms, setDoseForms] = useState([]);
  const [firstDoseDate, setFirstDoseDate] = useState(null);
  const [firstDoseTime, setFirstDoseTime] = useState(null);
  const [firstDoseCenterId, setFirstDoseCenterId] = useState(null);
  const [bookingFor, setBookingFor] = useState('self');

  const filter = {
    current: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { data: centers } = useCenter(filter);
  const { data: families } = useFamilyMember(filter);

  const timeSlots = useMemo(() => ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'], []);

  useEffect(() => {
    if (!firstDoseDate || !firstDoseTime || !firstDoseCenterId || !vaccine) {
      return;
    }

    const { dosesRequired, duration } = vaccine;

    const dates = [firstDoseDate];

    // Calculate all subsequent dose dates
    for (let i = 1; i < dosesRequired; i++) {
      const previousDate = dates[i - 1];
      if (!previousDate) continue;

      let nextDate = previousDate.add(duration, 'day');

      while (nextDate.day() === 0 || nextDate.day() === 6) {
        nextDate = nextDate.add(1, 'day');
      }

      dates.push(nextDate);
    }

    // Create dose forms for ALL doses (including first dose)
    const forms = [];
    for (let i = 0; i < dosesRequired; i++) {
      const date = dates[i];
      if (date) {
        forms.push({
          doseNumber: i + 1,
          date: date,
          time: i === 0 ? firstDoseTime : timeSlots[0] || '08:00',
          centerId: firstDoseCenterId, // All doses use the same center by default
        });
      }
    }

    setDoseForms(forms);

    // Set form values for all dose schedules - IMPORTANT: Must include ALL required fields
    const doseSchedulesValues = forms.map((form) => ({
      date: form.date,
      time: form.time,
      centerId: form.centerId,
    }));

    bookingForm.setFieldsValue({
      doseSchedules: doseSchedulesValues,
    });

    // IMPORTANT: Also update parent BookingPage state so data persists across steps
    if (setBookingData) {
      setBookingData((prev) => ({
        ...prev,
        doseSchedules: doseSchedulesValues,
      }));
    }
  }, [
    firstDoseDate,
    firstDoseTime,
    firstDoseCenterId,
    vaccine,
    bookingForm,
    timeSlots,
    setBookingData,
  ]);

  const handleDoseDateChange = (index, value) => {
    if (!value) return;
    const updatedForms = [...doseForms];
    const targetForm = updatedForms[index];
    if (targetForm) {
      targetForm.date = value;
      setDoseForms(updatedForms);

      const currentSchedules = bookingForm.getFieldValue('doseSchedules') || [];
      currentSchedules[index] = {
        ...currentSchedules[index],
        date: value,
        centerId: targetForm.centerId,
      };
      bookingForm.setFieldsValue({
        doseSchedules: currentSchedules,
      });

      if (index === 0) {
        setFirstDoseDate(value);
      }
    }
  };

  const handleDoseTimeChange = (index, value) => {
    const updatedForms = [...doseForms];
    const targetForm = updatedForms[index];
    if (targetForm) {
      targetForm.time = value;
      setDoseForms(updatedForms);

      const currentSchedules = bookingForm.getFieldValue('doseSchedules') || [];
      currentSchedules[index] = {
        ...currentSchedules[index],
        time: value,
        centerId: targetForm.centerId,
      };
      bookingForm.setFieldsValue({
        doseSchedules: currentSchedules,
      });

      if (index === 0) {
        setFirstDoseTime(value);
      }
    }
  };

  const handleFirstDoseDateChange = (date) => {
    setFirstDoseDate(date);
    // Update form value immediately
    bookingForm.setFieldsValue({ firstDoseDate: date });
  };

  const handleFirstDoseCenterChange = (centerId) => {
    setFirstDoseCenterId(centerId);
    // Update form value immediately
    bookingForm.setFieldsValue({ firstDoseCenter: centerId });
  };

  const handleDoseCenterChange = (index, centerId) => {
    const updatedForms = [...doseForms];
    const targetForm = updatedForms[index];
    if (targetForm) {
      targetForm.centerId = centerId;
      setDoseForms(updatedForms);

      const currentSchedules = bookingForm.getFieldValue('doseSchedules') || [];
      currentSchedules[index] = {
        ...currentSchedules[index],
        centerId: centerId,
      };
      bookingForm.setFieldsValue({
        doseSchedules: currentSchedules,
      });
    }
  };

  const disabledDate = (current) => {
    if (!current) return false;
    const isPast = current < dayjs().startOf('day');
    const isWeekend = current.day() === 0 || current.day() === 6;
    return isPast || isWeekend;
  };

  const handleBookingNext = async () => {
    try {
      // Validate all required fields
      await bookingForm.validateFields();

      // Additional validation for dose schedules
      const doseSchedules = bookingForm.getFieldValue('doseSchedules') || [];
      const requiredDoses = vaccine?.dosesRequired || 0;

      if (doseSchedules.length !== requiredDoses) {
        message.error(`Vui lòng hoàn thành tất cả ${requiredDoses} mũi tiêm`);
        return;
      }

      // Check if all doses have required fields
      const hasIncompleteDose = doseSchedules.some(
        (dose) => !dose || !dose.date || !dose.time || !dose.centerId
      );

      if (hasIncompleteDose) {
        message.error('Vui lòng điền đầy đủ thông tin cho tất cả các mũi tiêm');
        return;
      }

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

            {!firstDoseDate && (
              <Alert
                message="Hướng dẫn đặt lịch"
                description={
                  <div className="space-y-2">
                    <p>Vui lòng chọn ngày bắt đầu cho mũi tiêm đầu tiên.</p>
                    <p className="text-sm">
                      Hệ thống sẽ tự động tính toán lịch cho tất cả{' '}
                      <strong className="text-blue-600">{vaccine?.dosesRequired} mũi tiêm</strong>{' '}
                      dựa trên khoảng cách{' '}
                      <strong className="text-blue-600">{vaccine?.duration} ngày</strong>.
                    </p>
                  </div>
                }
                type="info"
                className="mb-6 border-l-4 border-l-blue-500"
                showIcon={false}
              />
            )}

            <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-blue-500 rounded" />
                  <Text strong className="text-base text-gray-700">
                    Thông tin mũi tiêm đầu tiên
                  </Text>
                </div>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn ngày</span>}
                    name="firstDoseDate"
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
                      onChange={handleFirstDoseDateChange}
                      suffixIcon={<CalendarOutlined />}
                      placeholder="Chọn ngày bắt đầu"
                      size="large"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn giờ</span>}
                    name="firstDoseTime"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn giờ',
                      },
                    ]}
                  >
                    <Select
                      options={timeSlots.map((time) => ({
                        value: time,
                        label: time,
                      }))}
                      value={firstDoseTime}
                      onChange={(value) => {
                        setFirstDoseTime(value);
                        bookingForm.setFieldsValue({ firstDoseTime: value });
                      }}
                      size="large"
                      placeholder="Chọn giờ tiêm"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16} className="mt-4">
                <Col xs={24}>
                  <Form.Item
                    label={<span className="font-semibold text-sm">Chọn địa điểm tiêm</span>}
                    name="firstDoseCenter"
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
                      value={firstDoseCenterId}
                      onChange={handleFirstDoseCenterChange}
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

            {doseForms.length > 0 ? (
              <div className="mt-6">
                <Divider orientation="left" className="border-blue-300">
                  <span className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    Lịch tiêm chi tiết
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {doseForms.length} mũi
                    </span>
                  </span>
                </Divider>

                <Form.List name="doseSchedules">
                  {(fields) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => {
                        const doseForm = doseForms[index];
                        if (!doseForm) return null;

                        const isFirstDose = index === 0;

                        return (
                          <Card
                            key={key}
                            size="small"
                            title={
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isFirstDose
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {doseForm.doseNumber}
                                </div>
                                <span>
                                  Mũi tiêm thứ {doseForm.doseNumber}
                                  {isFirstDose && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      Mũi đầu tiên
                                    </span>
                                  )}
                                </span>
                              </div>
                            }
                            className={`mb-4 transition-all hover:shadow-lg ${
                              isFirstDose ? 'border-2 border-blue-300' : 'border border-gray-200'
                            }`}
                          >
                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  {...restField}
                                  label={<span className="font-medium">Ngày tiêm</span>}
                                  name={[name, 'date']}
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
                                    disabledDate={(current) => {
                                      if (!current) return false;
                                      return current.day() === 0 || current.day() === 6;
                                    }}
                                    value={doseForm.date}
                                    onChange={(value) => handleDoseDateChange(index, value)}
                                    format="DD/MM/YYYY"
                                    size="large"
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  {...restField}
                                  label={<span className="font-medium">Giờ tiêm</span>}
                                  name={[name, 'time']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Vui lòng chọn giờ',
                                    },
                                  ]}
                                >
                                  <Select
                                    options={timeSlots.map((time) => ({
                                      value: time,
                                      label: time,
                                    }))}
                                    value={doseForm.time}
                                    onChange={(value) => handleDoseTimeChange(index, value)}
                                    size="large"
                                    placeholder="Chọn giờ"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16} className="mt-4">
                              <Col xs={24}>
                                <Form.Item
                                  {...restField}
                                  label={
                                    <span className="font-medium">
                                      Địa điểm tiêm
                                      {isFirstDose && (
                                        <span className="ml-2 text-xs text-gray-500">
                                          (mặc định từ mũi đầu tiên)
                                        </span>
                                      )}
                                    </span>
                                  }
                                  name={[name, 'centerId']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Vui lòng chọn địa điểm tiêm',
                                    },
                                  ]}
                                  initialValue={doseForm.centerId}
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
                                    value={doseForm.centerId}
                                    onChange={(value) => handleDoseCenterChange(index, value)}
                                    size="large"
                                    placeholder={
                                      isFirstDose
                                        ? 'Địa điểm được chọn ở trên'
                                        : 'Chọn địa điểm tiêm (mặc định: như mũi đầu)'
                                    }
                                    showSearch
                                    filterOption={(input, option) => {
                                      const center = centers?.result?.find(
                                        (c) => c.centerId === option?.value
                                      );
                                      return (
                                        center?.name
                                          ?.toLowerCase()
                                          ?.includes(input.toLowerCase()) || false
                                      );
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                    </>
                  )}
                </Form.List>
              </div>
            ) : (
              <div className="mt-6">
                <Alert
                  message="Chưa có lịch tiêm"
                  description="Vui lòng chọn ngày và giờ cho mũi tiêm đầu tiên để hệ thống tạo lịch tiêm chi tiết."
                  type="warning"
                  showIcon={false}
                />
              </div>
            )}
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
