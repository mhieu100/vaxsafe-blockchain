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
import { TIME_SLOT_LABELS } from '@/constants';
import { callUpdateAppointment } from '@/services/appointment.service';
import { getAvailableSlotsByCenterAndTimeSlotAPI } from '@/services/doctor.service';
import { useAccountStore } from '@/stores/useAccountStore';

const { Text } = Typography;
const { TextArea } = Input;

const AssignAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Set date when modal opens (use scheduledDate for pending appointments)
  useEffect(() => {
    if (open && appointment) {
      const targetDate = appointment.scheduledDate ? dayjs(appointment.scheduledDate) : dayjs();
      setSelectedDate(targetDate);
      form.setFieldsValue({
        appointmentDate: targetDate,
      });
    }

    // Reset state when modal closes
    if (!open) {
      form.resetFields();
      setSelectedSlotId(null);
      setSelectedDate(null);
      setAvailableSlots([]);
    }
  }, [open, appointment?.id]);

  // Fetch slots when selectedDate is available
  useEffect(() => {
    const loadSlots = async () => {
      if (!appointment?.centerId || !selectedDate) {
        return;
      }

      // Get scheduled time slot for pending appointments
      const targetTimeSlot = appointment.scheduledTimeSlot;
      if (!targetTimeSlot) {
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Không tìm thấy khung giờ đặt lịch',
        });
        return;
      }

      try {
        setLoadingSlots(true);
        const res = await getAvailableSlotsByCenterAndTimeSlotAPI(
          appointment.centerId,
          selectedDate.format('YYYY-MM-DD'),
          targetTimeSlot
        );

        if (res?.data) {
          setAvailableSlots(res.data);
          setSelectedSlotId(null);
        }
      } catch (error) {
        notification.error({
          message: 'Lỗi',
          description: error?.response?.data?.message || 'Không thể tải lịch trống',
        });
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (open && appointment?.centerId && selectedDate) {
      loadSlots();
    }
  }, [open, appointment?.centerId, appointment?.scheduledTimeSlot, selectedDate]);

  if (!appointment) return null;

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    form.setFieldsValue({ slotId });
  };

  const handleConfirmAssign = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['slotId']);

      const slotIdNumber = Number(values.slotId);
      const selectedSlot = availableSlots.find((slot) => slot.slotId === slotIdNumber);

      if (!selectedSlot) {
        throw new Error('Không tìm thấy thông tin khung giờ');
      }

      const res = await callUpdateAppointment(
        appointment.id,
        selectedSlot.doctorId,
        values.slotId,
        selectedSlot.startTime
      );

      if (res?.data) {
        message.success('Phân công bác sĩ thành công!');
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: error.message || 'Không thể phân công bác sĩ',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
    setSelectedSlotId(null);
    setSelectedDate(null);
    setAvailableSlots([]);
  };

  const fetchAvailableSlots = async () => {
    if (!appointment?.centerId || !selectedDate) return;

    const targetTimeSlot = appointment.scheduledTimeSlot;
    if (!targetTimeSlot) return;

    try {
      setLoadingSlots(true);
      const res = await getAvailableSlotsByCenterAndTimeSlotAPI(
        appointment.centerId,
        selectedDate.format('YYYY-MM-DD'),
        targetTimeSlot
      );

      if (res?.data) {
        setAvailableSlots(res.data);
        setSelectedSlotId(null);
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải lịch trống',
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const renderAvailableSlots = () => {
    if (loadingSlots) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin spinning tip="Đang tải lịch trống...">
            <div style={{ minHeight: 50 }} />
          </Spin>
        </div>
      );
    }

    if (availableSlots.length === 0) {
      const timeSlotLabel = appointment?.scheduledTimeSlot
        ? TIME_SLOT_LABELS[appointment.scheduledTimeSlot]
        : '';

      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <span>
                Không có lịch trống trong khung giờ{' '}
                {timeSlotLabel && <strong>{timeSlotLabel}</strong>}
              </span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Không có bác sĩ nào có slot trống trong khung giờ này
              </Text>
              <Button icon={<ReloadOutlined />} onClick={fetchAvailableSlots}>
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
          maxHeight: '400px',
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
          <Row gutter={[12, 12]}>
            {availableSlots.map((slot) => (
              <Col key={slot.slotId} xs={24} sm={12} md={8}>
                <Radio
                  value={slot.slotId}
                  disabled={slot.status !== 'AVAILABLE'}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 12,
                    background: slot.status === 'AVAILABLE' ? '#f6ffed' : '#fff2e8',
                    border: `2px solid ${
                      selectedSlotId === slot.slotId
                        ? '#1890ff'
                        : slot.status === 'AVAILABLE'
                          ? '#b7eb8f'
                          : '#ffbb96'
                    }`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <Text strong style={{ fontSize: 14 }}>
                        {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                      </Text>
                    </Space>
                    <Tag color="blue" icon={<UserOutlined />} style={{ marginLeft: 0 }}>
                      Bs. {slot.doctorName}
                    </Tag>
                    <Tag
                      color={slot.status === 'AVAILABLE' ? 'success' : 'error'}
                      style={{ marginLeft: 0 }}
                    >
                      {slot.status === 'AVAILABLE' ? 'Trống' : 'Đã đặt'}
                    </Tag>
                  </Space>
                </Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span>Phân Công Lịch Hẹn</span>
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
          Xác Nhận Phân Công
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
          </Space>
        }
        style={{
          marginBottom: 24,
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
            <Text strong>{appointment.patientPhone || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Vaccine:</Text>
            <br />
            <Tag color="blue">{appointment.vaccineName}</Tag>
          </Col>

          <Col span={12}>
            <Text type="secondary">Ngày đăng ký:</Text>
            <br />
            <Text strong>{dayjs(appointment.scheduledDate).format('DD/MM/YYYY')}</Text>
            <br />
            {appointment.scheduledTimeSlot && (
              <Tag color="blue">{TIME_SLOT_LABELS[appointment.scheduledTimeSlot]}</Tag>
            )}
          </Col>

          <Col span={12}>
            <Text type="secondary">Trung tâm:</Text>
            <br />
            <Text>{appointment.centerName}</Text>
          </Col>

          {appointment.notes && (
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
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
        {appointment?.scheduledTimeSlot && (
          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                <span>
                  Khung giờ đặt lịch:{' '}
                  <strong>{TIME_SLOT_LABELS[appointment.scheduledTimeSlot]}</strong>
                </span>
              </Space>
            }
            type="info"
            showIcon={false}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="slotId"
          label={
            <Space>
              <Text strong>Chọn Khung Giờ Của Bác Sĩ</Text>
              {selectedDate && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({selectedDate.format('DD/MM/YYYY')})
                </Text>
              )}
            </Space>
          }
          rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
          tooltip="Chọn khung giờ trống từ lịch của bác sĩ (mỗi khung 15 phút)"
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
