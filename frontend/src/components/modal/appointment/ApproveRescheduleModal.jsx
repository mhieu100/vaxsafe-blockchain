import {
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

const { Text } = Typography;
const { TextArea } = Input;

const ApproveRescheduleModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Set date when modal opens (use desiredDate for reschedule)
  useEffect(() => {
    if (open && appointment) {
      const targetDate = appointment.desiredDate ? dayjs(appointment.desiredDate) : dayjs();
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

      // Get desired time slot from reschedule request
      const targetTimeSlot = appointment.desiredTimeSlot;
      if (!targetTimeSlot) {
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Không tìm thấy khung giờ mong muốn',
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
  }, [open, appointment?.centerId, appointment?.desiredTimeSlot, selectedDate]);

  if (!appointment) return null;

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    form.setFieldsValue({ slotId });
  };

  const handleConfirmApprove = async () => {
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
        message.success('Phê duyệt yêu cầu đổi lịch thành công!');
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: error.message || 'Không thể phê duyệt yêu cầu đổi lịch',
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

    const targetTimeSlot = appointment.desiredTimeSlot;
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
      const timeSlotLabel = appointment?.desiredTimeSlot
        ? TIME_SLOT_LABELS[appointment.desiredTimeSlot]
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
          <EditOutlined style={{ color: '#faad14' }} />
          <span>Duyệt Yêu Cầu Đổi Lịch</span>
          <Tag color="warning">RESCHEDULE</Tag>
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
          onClick={handleConfirmApprove}
          disabled={!selectedSlotId}
        >
          Xác Nhận Đổi Lịch
        </Button>,
      ]}
      destroyOnClose
    >
      {/* Reschedule Request Info */}
      <Card
        size="small"
        title={
          <Space>
            <InfoCircleOutlined />
            <span>Thông Tin Yêu Cầu Đổi Lịch</span>
            <Tag color="warning" icon={<EditOutlined />}>
              Yêu cầu đổi lịch
            </Tag>
          </Space>
        }
        style={{
          marginBottom: 24,
          background: '#fffbf0',
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

          {/* Old schedule */}
          <Col span={24}>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ color: '#ff4d4f' }}>
              Lịch Cũ:
            </Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Ngày cũ:</Text>
            <br />
            <Text delete style={{ color: '#999' }}>
              {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')}
            </Text>
            <br />
            {appointment.scheduledTimeSlot && (
              <Tag color="default">{TIME_SLOT_LABELS[appointment.scheduledTimeSlot]}</Tag>
            )}
            {appointment.actualScheduledTime && (
              <Tag color="default">Giờ: {appointment.actualScheduledTime.substring(0, 5)}</Tag>
            )}
          </Col>
          <Col span={12}>
            <Text type="secondary">Bác sĩ cũ:</Text>
            <br />
            <Text delete style={{ color: '#999' }}>
              {appointment.doctorName || 'Chưa có'}
            </Text>
          </Col>

          {/* New desired schedule */}
          <Col span={24}>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ color: '#52c41a' }}>
              Lịch Mới Mong Muốn:
            </Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Ngày mới:</Text>
            <br />
            <Text strong style={{ color: '#52c41a' }}>
              {dayjs(appointment.desiredDate).format('DD/MM/YYYY')}
            </Text>
            <br />
            {appointment.desiredTimeSlot && (
              <Tag color="green">{TIME_SLOT_LABELS[appointment.desiredTimeSlot]}</Tag>
            )}
          </Col>
          <Col span={12}>
            <Text type="secondary">Thời gian yêu cầu:</Text>
            <br />
            <Text type="warning">
              {dayjs(appointment.rescheduledAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Col>

          {appointment.rescheduleReason && (
            <Col span={24}>
              <Text type="secondary">Lý do đổi lịch:</Text>
              <br />
              <Text strong style={{ color: '#fa8c16' }}>
                {appointment.rescheduleReason}
              </Text>
            </Col>
          )}

          <Col span={24}>
            <Text type="secondary">Trung tâm:</Text>
            <br />
            <Text>{appointment.centerName}</Text>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Assignment Form */}
      <Form form={form} layout="vertical">
        {appointment?.desiredTimeSlot && (
          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                <span>
                  Khung giờ mong muốn:{' '}
                  <strong>{TIME_SLOT_LABELS[appointment.desiredTimeSlot]}</strong>
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
          tooltip="Chọn khung giờ trống từ lịch của bác sĩ cho ngày mới"
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

export default ApproveRescheduleModal;
