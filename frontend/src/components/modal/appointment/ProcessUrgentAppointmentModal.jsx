import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
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
import { callUpdateAppointment } from '@/services/appointment.service';
import {
  callGetAvailableDoctorsByCenter,
  callGetDoctorAvailableSlots,
} from '@/services/doctor.service';
import { useAccountStore } from '@/stores/useAccountStore';
import { formatAppointmentTime, formatDesiredTime } from '@/utils/appointment';

const { Text } = Typography;
const { TextArea } = Input;

const ProcessUrgentAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const user = useAccountStore((state) => state.user);
  const userCenterId = user?.centerId;

  // Xác định các giá trị từ appointment (với fallback để tránh lỗi)
  const isRescheduleRequest = appointment?.urgencyType === 'RESCHEDULE_PENDING';
  const _needsDoctor = appointment?.urgencyType === 'NO_DOCTOR' || !appointment?.doctorName;

  // Xác định ngày cần xem lịch
  const targetDate = isRescheduleRequest ? appointment?.desiredDate : appointment?.scheduledDate;

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await callGetAvailableDoctorsByCenter(userCenterId);
      if (res?.data) {
        setDoctors(res.data);
      }
    } catch (_error) {
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
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const res = await callGetDoctorAvailableSlots(doctorId, formattedDate);

      if (res?.data) {
        setAvailableSlots(res.data);
        // Reset selected slot when slots change
        setSelectedSlotId(null);
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

  // Fetch doctors when modal opens
  useEffect(() => {
    if (open && userCenterId) {
      fetchDoctors();
    }
  }, [open, userCenterId]);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && targetDate) {
      fetchAvailableSlots(selectedDoctorId, targetDate);
    }
  }, [selectedDoctorId, targetDate]);

  // Early return AFTER all hooks
  if (!appointment) return null;

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    form.setFieldsValue({ doctorId });

    // Find the selected doctor to get userId (backend needs userId, not doctorId)
    const selectedDoctor = doctors.find((d) => d.doctorId === doctorId);
    if (selectedDoctor) {
      form.setFieldsValue({ userId: selectedDoctor.userId });
    }
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    form.setFieldsValue({ slotId });
  };

  const handleApproveReschedule = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['doctorId', 'slotId']);

      // Backend expects userId (from users table), not doctorId (from doctors table)
      const selectedDoctor = doctors.find((d) => d.doctorId === values.doctorId);
      if (!selectedDoctor) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }

      // Call API to approve reschedule and assign doctor with specific slot
      const res = await callUpdateAppointment(
        appointment.id,
        selectedDoctor.userId, // Send userId, not doctorId
        values.slotId
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

  const handleRejectReschedule = async () => {
    try {
      setLoading(true);
      const _values = await form.validateFields(['rejectReason']);

      // TODO: Call API to reject reschedule (set status back to SCHEDULED)
      message.info('Tính năng từ chối đang được phát triển');

      handleClose();
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['doctorId', 'slotId']);

      // Backend expects userId (from users table), not doctorId (from doctors table)
      const selectedDoctor = doctors.find((d) => d.doctorId === values.doctorId);
      if (!selectedDoctor) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }

      const res = await callUpdateAppointment(
        appointment.id,
        selectedDoctor.userId, // Send userId, not doctorId
        values.slotId
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
    setSelectedDoctorId(null);
    setSelectedSlotId(null);
    setAvailableSlots([]);
  };

  const getUrgencyColor = (priorityLevel) => {
    const colors = {
      1: 'red',
      2: 'orange',
      3: 'gold',
      4: 'blue',
      5: 'default',
    };
    return colors[priorityLevel] || 'default';
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
            <Space orientation="vertical">
              <span>Không có lịch trống trong ngày này</span>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchAvailableSlots(selectedDoctorId, targetDate)}
              >
                Tải lại
              </Button>
            </Space>
          }
        />
      );
    }

    return (
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <Radio.Group
          value={selectedSlotId}
          onChange={(e) => handleSlotSelect(e.target.value)}
          style={{ width: '100%' }}
        >
          <Row gutter={[8, 8]}>
            {availableSlots.map((slot) => (
              <Col span={8} key={slot.slotId}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderColor: selectedSlotId === slot.slotId ? '#1890ff' : '#d9d9d9',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSlotSelect(slot.slotId)}
                >
                  <Radio value={slot.slotId}>
                    <Space orientation="vertical" size={0}>
                      <Text strong>
                        <ClockCircleOutlined /> {slot.startTime?.substring(0, 5)} -{' '}
                        {slot.endTime?.substring(0, 5)}
                      </Text>
                      <Tag color="green" size="small">
                        {slot.status}
                      </Tag>
                    </Space>
                  </Radio>
                </Card>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </div>
    );
  };

  const renderRescheduleApproval = () => (
    <>
      <Alert
        message="Yêu cầu đổi lịch hẹn"
        description={
          <Space orientation="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Lịch cũ:</strong> {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')} lúc{' '}
              {formatAppointmentTime(appointment)}
            </div>
            <div>
              <strong>Lịch mới mong muốn:</strong>{' '}
              {dayjs(appointment.desiredDate).format('DD/MM/YYYY')} lúc{' '}
              {formatDesiredTime(appointment)}
            </div>
            {appointment.rescheduleReason && (
              <div>
                <strong>Lý do:</strong> {appointment.rescheduleReason}
              </div>
            )}
          </Space>
        }
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="doctorId"
          label="Chọn bác sĩ mới"
          rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
        >
          <Select
            placeholder="Chọn bác sĩ phụ trách"
            showSearch
            optionFilterProp="children"
            size="large"
            loading={loadingDoctors}
            onChange={handleDoctorChange}
          >
            {doctors.map((doctor) => (
              <Select.Option key={doctor.doctorId} value={doctor.doctorId}>
                <Space>
                  <UserOutlined />
                  {doctor.doctorName}
                  {doctor.specialization && <Tag color="blue">{doctor.specialization}</Tag>}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="slotId"
          label={`Chọn khung giờ (${dayjs(targetDate).format('DD/MM/YYYY')})`}
          rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
        >
          {renderAvailableSlots()}
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú (không bắt buộc)">
          <TextArea rows={3} placeholder="Nhập ghi chú nếu cần..." />
        </Form.Item>
      </Form>

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'Từ chối yêu cầu đổi lịch?',
              content: (
                <Form layout="vertical">
                  <Form.Item label="Lý do từ chối">
                    <TextArea rows={3} placeholder="Nhập lý do từ chối..." />
                  </Form.Item>
                </Form>
              ),
              okText: 'Từ chối',
              cancelText: 'Hủy',
              okButtonProps: { danger: true },
              onOk: handleRejectReschedule,
            });
          }}
        >
          Từ chối
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={handleApproveReschedule}
          disabled={!selectedSlotId}
        >
          Phê duyệt & Phân công bác sĩ
        </Button>
      </Space>
    </>
  );

  const renderDoctorAssignment = () => (
    <>
      <Alert
        message="Phân công bác sĩ"
        description={`Lịch hẹn này chưa được phân công bác sĩ. Chọn bác sĩ và khung giờ phù hợp cho ngày ${dayjs(
          targetDate
        ).format('DD/MM/YYYY')}.`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="doctorId"
          label="Chọn bác sĩ"
          rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
        >
          <Select
            placeholder="Chọn bác sĩ phụ trách"
            showSearch
            optionFilterProp="children"
            size="large"
            loading={loadingDoctors}
            onChange={handleDoctorChange}
          >
            {doctors.map((doctor) => (
              <Select.Option key={doctor.doctorId} value={doctor.doctorId}>
                <Space>
                  <UserOutlined />
                  {doctor.doctorName}
                  {doctor.specialization && <Tag color="blue">{doctor.specialization}</Tag>}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="slotId"
          label={`Chọn khung giờ (${dayjs(targetDate).format('DD/MM/YYYY')})`}
          rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
        >
          {renderAvailableSlots()}
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú (không bắt buộc)">
          <TextArea rows={3} placeholder="Nhập ghi chú nếu cần..." />
        </Form.Item>
      </Form>

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button size="large" onClick={handleClose}>
          Hủy
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={handleAssignDoctor}
          disabled={!selectedSlotId}
        >
          Phân công bác sĩ
        </Button>
      </Space>
    </>
  );

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span>Xử lý lịch hẹn #{appointment.id}</span>
          <Tag color={getUrgencyColor(appointment.priorityLevel)}>
            Priority {appointment.priorityLevel}
          </Tag>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      destroyOnHidden
    >
      {/* Patient Information */}
      <Descriptions
        title="Thông tin bệnh nhân"
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="Họ tên" span={2}>
          <strong>{appointment.patientName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{appointment.patientPhone}</Descriptions.Item>
        <Descriptions.Item label="Email">{appointment.patientEmail}</Descriptions.Item>
        <Descriptions.Item label="Vaccine">{appointment.vaccineName}</Descriptions.Item>
        <Descriptions.Item label="Mũi tiêm">Mũi {appointment.doseNumber}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <Tag color={appointment.status === 'RESCHEDULE' ? 'orange' : 'default'}>
            {appointment.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Action based on urgency type */}
      {isRescheduleRequest ? renderRescheduleApproval() : renderDoctorAssignment()}
    </Modal>
  );
};

export default ProcessUrgentAppointmentModal;
