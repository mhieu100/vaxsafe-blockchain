import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  message,
  notification,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { callUpdateAppointment } from '../../config/api.appointment';
import { getAvailableSlotsAPI, getDoctorsWithScheduleAPI } from '../../config/api.doctor.schedule';
import { useAccountStore } from '../../stores/useAccountStore';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AssignAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const _user = useAccountStore((state) => state.user);

  // Check if this is a reschedule request
  const isRescheduleRequest = appointment?.status === 'PENDING_APPROVAL';

  // Determine target date
  const getTargetDate = () => {
    if (isRescheduleRequest && appointment?.desiredDate) {
      return dayjs(appointment.desiredDate);
    }
    if (appointment?.scheduledDate) {
      return dayjs(appointment.scheduledDate);
    }
    return dayjs();
  };

  // Fetch doctors when modal opens
  useEffect(() => {
    if (open) {
      const targetDate = getTargetDate();
      setSelectedDate(targetDate);
      form.setFieldsValue({
        appointmentDate: targetDate,
      });
      fetchDoctors(targetDate.format('YYYY-MM-DD'));
    }
  }, [open, fetchDoctors, form.setFieldsValue, getTargetDate]);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchAvailableSlots(selectedDoctorId, selectedDate.format('YYYY-MM-DD'));
    }
  }, [selectedDoctorId, selectedDate, fetchAvailableSlots]);

  if (!appointment) return null;

  const fetchDoctors = async (date) => {
    try {
      setLoadingDoctors(true);
      const res = await getDoctorsWithScheduleAPI(date);
      if (res?.data) {
        setDoctors(res.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách bác sĩ',
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      const res = await getAvailableSlotsAPI(doctorId, date);

      if (res?.data) {
        setAvailableSlots(res.data);
        setSelectedSlotId(null);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải lịch trống của bác sĩ',
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    form.setFieldsValue({ doctorId });

    // Find the selected doctor to get userId
    const selectedDoctor = doctors.find((d) => d.doctorId === doctorId);
    if (selectedDoctor) {
      form.setFieldsValue({ userId: selectedDoctor.userId });
    }
  };

  const _handleDateChange = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({ appointmentDate: date });

    // Reload doctors with new date
    if (date) {
      fetchDoctors(date.format('YYYY-MM-DD'));
    }

    // Clear selected slot when date changes
    setSelectedSlotId(null);
    setAvailableSlots([]);
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    form.setFieldsValue({ slotId });
  };

  const handleConfirmAssign = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['doctorId', 'slotId']);

      const selectedDoctor = doctors.find((d) => d.doctorId === values.doctorId);
      if (!selectedDoctor) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }

      const res = await callUpdateAppointment(appointment.id, selectedDoctor.userId, values.slotId);

      if (res?.data) {
        message.success(
          isRescheduleRequest
            ? 'Phê duyệt yêu cầu đổi lịch thành công!'
            : 'Phân công bác sĩ thành công!'
        );
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error('Error assigning appointment:', error);
      notification.error({
        message: 'Có lỗi xảy ra',
        description:
          error.message ||
          (isRescheduleRequest
            ? 'Không thể phê duyệt yêu cầu đổi lịch'
            : 'Không thể phân công bác sĩ'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
    setSelectedDoctorId(null);
    setSelectedSlotId(null);
    setSelectedDate(null);
    setAvailableSlots([]);
    setDoctors([]);
  };

  const renderAvailableSlots = () => {
    if (loadingSlots) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Đang tải lịch trống..." />
        </div>
      );
    }

    if (!selectedDoctorId) {
      return (
        <Alert
          message="Vui lòng chọn bác sĩ"
          description="Chọn bác sĩ để xem lịch trống có sẵn"
          type="info"
          showIcon
        />
      );
    }

    if (availableSlots.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <span>Không có lịch trống trong ngày này</span>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchAvailableSlots(selectedDoctorId, selectedDate.format('YYYY-MM-DD'))
                }
              >
                Tải lại
              </Button>
            </Space>
          }
        />
      );
    }

    return (
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Radio.Group
          value={selectedSlotId}
          onChange={(e) => handleSlotSelect(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {availableSlots.map((slot) => (
              <Radio
                key={slot.slotId}
                value={slot.slotId}
                disabled={slot.status !== 'AVAILABLE'}
                style={{
                  width: '100%',
                  padding: 12,
                  background: slot.status === 'AVAILABLE' ? '#f6ffed' : '#fff2e8',
                  border: `1px solid ${slot.status === 'AVAILABLE' ? '#b7eb8f' : '#ffbb96'}`,
                  borderRadius: 8,
                }}
              >
                <Space
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </Space>
                  <Tag color={slot.status === 'AVAILABLE' ? 'success' : 'error'}>
                    {slot.status === 'AVAILABLE' ? 'Trống' : 'Đã đặt'}
                  </Tag>
                </Space>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          {isRescheduleRequest ? (
            <>
              <EditOutlined style={{ color: '#faad14' }} />
              <span>Duyệt Yêu Cầu Đổi Lịch</span>
              <Tag color="warning">PENDING_APPROVAL</Tag>
            </>
          ) : (
            <>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <span>Phân Công Lịch Hẹn</span>
            </>
          )}
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={handleConfirmAssign}
          disabled={!selectedSlotId}
        >
          {isRescheduleRequest ? 'Xác Nhận Đổi Lịch' : 'Xác Nhận Phân Công'}
        </Button>,
      ]}
      destroyOnClose
    >
      {/* Appointment Info */}
      <Card
        size="small"
        title={
          <Space>
            <InfoCircleOutlined />
            <span>Thông Tin Lịch Hẹn</span>
            {isRescheduleRequest && (
              <Tag color="warning" icon={<EditOutlined />}>
                Yêu cầu đổi lịch
              </Tag>
            )}
          </Space>
        }
        style={{
          marginBottom: 24,
          background: isRescheduleRequest ? '#fffbf0' : 'white',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text type="secondary">Mã lịch hẹn:</Text>
            <br />
            <Text strong>#{appointment.id}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Bệnh nhân:</Text>
            <br />
            <Text strong>{appointment.patientName}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Số điện thoại:</Text>
            <br />
            <Text strong>{appointment.phone || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Vaccine:</Text>
            <br />
            <Tag color="blue">{appointment.vaccineName}</Tag>
          </Col>

          {/* Show old schedule if rescheduling */}
          {isRescheduleRequest && appointment.scheduledDate && (
            <>
              <Col span={24}>
                <Divider style={{ margin: '12px 0' }} />
                <Text strong style={{ color: '#ff4d4f' }}>
                  Lịch Cũ (Đang muốn đổi):
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày cũ:</Text>
                <br />
                <Text delete style={{ color: '#999' }}>
                  {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')}
                  {appointment.scheduledTime && ` - ${appointment.scheduledTime}`}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Bác sĩ cũ:</Text>
                <br />
                <Text delete style={{ color: '#999' }}>
                  {appointment.doctorName || 'Chưa có'}
                </Text>
              </Col>
            </>
          )}

          <Col span={24}>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ color: '#52c41a' }}>
              {isRescheduleRequest ? 'Lịch Mới (Yêu cầu):' : 'Thông tin yêu cầu:'}
            </Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">
              {isRescheduleRequest ? 'Ngày mới mong muốn:' : 'Ngày mong muốn:'}
            </Text>
            <br />
            <Text
              strong
              style={{
                color: isRescheduleRequest ? '#52c41a' : '#ff4d4f',
              }}
            >
              {dayjs(appointment.desiredDate || appointment.scheduledDate).format('DD/MM/YYYY')}
              {appointment.desiredTime && ` - ${appointment.desiredTime}`}
            </Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">
              {isRescheduleRequest ? 'Thời gian yêu cầu:' : 'Trung tâm:'}
            </Text>
            <br />
            {isRescheduleRequest ? (
              <Text type="warning">
                {dayjs(appointment.rescheduledAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            ) : (
              <Text>{appointment.centerName}</Text>
            )}
          </Col>

          {isRescheduleRequest && appointment.rescheduleReason && (
            <Col span={24}>
              <Text type="secondary">Lý do đổi lịch:</Text>
              <br />
              <Text strong style={{ color: '#fa8c16' }}>
                {appointment.rescheduleReason}
              </Text>
            </Col>
          )}

          {!isRescheduleRequest && appointment.notes && (
            <Col span={24}>
              <Text type="secondary">Ghi chú:</Text>
              <br />
              <Text>{appointment.notes}</Text>
            </Col>
          )}
        </Row>
      </Card>

      <Divider />

      {/* Assignment Form */}
      <Form form={form} layout="vertical">
        <Form.Item
          name="appointmentDate"
          label={<Text strong>Chọn Ngày</Text>}
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <Input
            value={selectedDate?.format('DD/MM/YYYY')}
            readOnly
            size="large"
            prefix={<CalendarOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="doctorId"
          label={<Text strong>Chọn Bác Sĩ</Text>}
          rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
        >
          <Select
            placeholder="-- Chọn bác sĩ --"
            showSearch
            optionFilterProp="children"
            size="large"
            loading={loadingDoctors}
            onChange={handleDoctorChange}
          >
            {doctors.map((doctor) => (
              <Option key={doctor.doctorId} value={doctor.doctorId}>
                <Space>
                  <UserOutlined />
                  <span>{doctor.doctorName}</span>
                  {doctor.specialization && <Tag color="blue">{doctor.specialization}</Tag>}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({doctor.availableSlotsToday} slot trống)
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="slotId"
          label={
            <Space>
              <Text strong>Chọn Khung Giờ</Text>
              {selectedDate && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({selectedDate.format('DD/MM/YYYY')})
                </Text>
              )}
            </Space>
          }
          rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
        >
          {renderAvailableSlots()}
        </Form.Item>

        <Form.Item name="notes" label={<Text strong>Ghi Chú Thêm (Tùy chọn)</Text>}>
          <TextArea rows={3} placeholder="Nhập ghi chú cho bác sĩ..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignAppointmentModal;
