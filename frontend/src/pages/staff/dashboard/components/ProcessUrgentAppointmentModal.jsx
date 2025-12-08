import {
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
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
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { callUpdateAppointment } from '@/services/appointment.service';
import {
  callGetAvailableDoctorsByCenter,
  callGetDoctorAvailableSlots,
} from '@/services/doctor.service';
import { useAccountStore } from '@/stores/useAccountStore';

const { Text } = Typography;
const { TextArea } = Input;

const ProcessUrgentAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlotUiId, setSelectedSlotUiId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const user = useAccountStore((state) => state.user);
  const userCenterId = user?.centerId;

  const isRescheduleRequest = appointment?.urgencyType === 'RESCHEDULE_PENDING';
  const targetDate = isRescheduleRequest ? appointment?.desiredDate : appointment?.scheduledDate;

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await callGetAvailableDoctorsByCenter(userCenterId);
      if (res?.data) {
        setDoctors(res.data);
      }
    } catch (_error) {
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const res = await callGetDoctorAvailableSlots(doctorId, formattedDate);

      if (res?.data) {
        const slotsWithIds = res.data.map((slot, index) => ({
          ...slot,
          uiId: slot.slotId ? String(slot.slotId) : `virtual-${index}-${slot.startTime}`,
        }));

        setAvailableSlots(slotsWithIds);
        setSelectedSlotUiId(null);
      }
    } catch (_error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải lịch trống của bác sĩ',
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (open && userCenterId) {
      fetchDoctors();
    }
  }, [open, userCenterId]);

  useEffect(() => {
    if (selectedDoctorId && targetDate) {
      fetchAvailableSlots(selectedDoctorId, targetDate);
    }
  }, [selectedDoctorId, targetDate]);

  const handleClose = () => {
    onClose();
    form.resetFields();
    setSelectedDoctorId(null);
    setSelectedSlotUiId(null);
    setAvailableSlots([]);
  };

  if (!appointment) return null;

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    form.setFieldsValue({ doctorId });
    const selectedDoctor = doctors.find((d) => d.doctorId === doctorId);
    if (selectedDoctor) {
      form.setFieldsValue({ userId: selectedDoctor.userId });
    }
  };

  const handleSlotSelect = (uiId) => {
    setSelectedSlotUiId(uiId);
    const slot = availableSlots.find((s) => s.uiId === uiId);
    if (slot) {
      form.setFieldsValue({
        slotId: slot.slotId,
        actualScheduledTime: slot.startTime,
      });
    }
  };

  const handleProcess = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['doctorId']);

      if (!selectedSlotUiId) {
        message.error('Vui lòng chọn khung giờ!');
        return;
      }

      const selectedDoctor = doctors.find((d) => d.doctorId === values.doctorId);
      if (!selectedDoctor) throw new Error('Không tìm thấy thông tin bác sĩ');

      const slot = availableSlots.find((s) => s.uiId === selectedSlotUiId);
      if (!slot) throw new Error('Slot invalid');

      const res = await callUpdateAppointment(
        appointment.id,
        selectedDoctor.doctorId,
        slot.slotId || null,
        slot.startTime
      );

      if (res?.data) {
        message.success('Cập nhật lịch hẹn thành công!');
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: error.message || 'Không thể cập nhật lịch hẹn',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPatientInfo = () => (
    <Card
      title={
        <Space>
          <UserOutlined /> Thông Tin Bệnh Nhân
        </Space>
      }
      bordered={false}
      style={{ background: '#f9fafb', marginBottom: 16 }}
      size="small"
    >
      <Space align="start">
        <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
          {appointment?.patientName?.charAt(0)}
        </Avatar>
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {appointment?.patientName}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Tag icon={<PhoneOutlined />} color="default">
              {appointment?.patientPhone || 'N/A'}
            </Tag>
            <Tag icon={<MailOutlined />} color="default">
              {appointment?.patientEmail || 'N/A'}
            </Tag>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              <MedicineBoxOutlined /> Vaccine:{' '}
            </Text>
            <Text strong>{appointment?.vaccineName}</Text>
          </div>
        </div>
      </Space>
    </Card>
  );

  const renderDateComparison = () => {
    if (!isRescheduleRequest) {
      return (
        <Card
          size="small"
          style={{ marginBottom: 16, borderColor: '#d9f7be', background: '#f6ffed' }}
        >
          <Text type="secondary">Ngày hẹn:</Text>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#389e0d' }}>
            {dayjs(targetDate).format('dddd, DD/MM/YYYY')}
          </div>
          {appointment.scheduledTimeSlot && (
            <Tag color="green">{appointment.scheduledTimeSlot}</Tag>
          )}
        </Card>
      );
    }

    return (
      <Card
        size="small"
        style={{ marginBottom: 16, borderColor: '#ffccc7', background: '#fff1f0' }}
      >
        <Row align="middle" justify="space-between">
          <Col span={10} style={{ textAlign: 'center' }}>
            <Text type="secondary" delete>
              Lịch Cũ
            </Text>
            <div style={{ fontWeight: 500, color: '#bfbfbf' }}>
              {dayjs(appointment.scheduledDate).format('DD/MM')}
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <RightOutlined style={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={10} style={{ textAlign: 'center' }}>
            <Text type="danger">Lịch Mới</Text>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#cf1322' }}>
              {dayjs(targetDate).format('DD/MM')}
            </div>
          </Col>
        </Row>
        {appointment.rescheduleReason && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              background: '#fff',
              borderRadius: 4,
              border: '1px dashed #ffa39e',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Lý do:
            </Text>
            <div>
              <Text italic>{appointment.rescheduleReason}</Text>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderSlotGrid = () => {
    if (loadingSlots) {
      return (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      );
    }
    if (!selectedDoctorId) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn bác sĩ để xem lịch" />;
    }
    if (availableSlots.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bác sĩ bận cả ngày" />;
    }

    return (
      <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
        <Row gutter={[8, 8]}>
          {availableSlots.map((slot) => {
            const isSelected = selectedSlotUiId === slot.uiId;
            return (
              <Col span={8} key={slot.uiId}>
                <div
                  onClick={() => handleSlotSelect(slot.uiId)}
                  style={{
                    border: `1px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                    borderRadius: 6,
                    padding: '8px 4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      fontWeight: isSelected ? 'bold' : 'normal',
                      color: isSelected ? '#1890ff' : 'inherit',
                    }}
                  >
                    {slot.startTime?.substring(0, 5)}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          {isRescheduleRequest ? (
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          ) : (
            <CalendarOutlined style={{ color: '#1890ff' }} />
          )}
          <span style={{ fontSize: 18 }}>
            {isRescheduleRequest ? 'Duyệt Đổi Lịch Hẹn' : 'Phân Công Bác Sĩ'}
          </span>
        </Space>
      }
      width={900}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={loading}
          disabled={!selectedSlotUiId}
          onClick={handleProcess}
        >
          {isRescheduleRequest ? 'Phê duyệt & Lưu' : 'Xác nhận Phân công'}
        </Button>,
      ]}
    >
      <Row gutter={24}>
        {}
        <Col span={10} style={{ borderRight: '1px solid #f0f0f0' }}>
          {renderPatientInfo()}
          {renderDateComparison()}

          <Divider orientation="left" style={{ fontSize: 12 }}>
            Ghi chú nội bộ
          </Divider>
          <Form form={form} layout="vertical">
            <Form.Item name="notes">
              <TextArea
                placeholder="Ghi chú thêm cho bác sĩ/ticket..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </Form>
        </Col>

        {}
        <Col span={14}>
          <Alert
            type="info"
            banner
            icon={<InfoCircleOutlined />}
            message={`Chọn bác sĩ cho ngày ${targetDate ? dayjs(targetDate).format('DD/MM/YYYY') : '...'}`}
            style={{ marginBottom: 16, borderRadius: 4 }}
          />

          <Form form={form} layout="vertical">
            <Form.Item
              name="doctorId"
              label={<Text strong>Chọn Bác Sĩ Phụ Trách</Text>}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="-- Chọn bác sĩ --"
                loading={loadingDoctors}
                onChange={handleDoctorChange}
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {doctors.map((d) => (
                  <Select.Option key={d.doctorId} value={d.doctorId}>
                    <Space>
                      <Avatar size="small" src={d.avatar} icon={<UserOutlined />} />
                      <span>{d.doctorName}</span>
                      {d.specialization && <Tag style={{ marginLeft: 8 }}>{d.specialization}</Tag>}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              required
              label={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>Khung Giờ Trống</Text>
                  {availableSlots.length > 0 && (
                    <Tag color="blue">{availableSlots.length} slots</Tag>
                  )}
                </Space>
              }
            >
              {renderSlotGrid()}
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default ProcessUrgentAppointmentModal;
