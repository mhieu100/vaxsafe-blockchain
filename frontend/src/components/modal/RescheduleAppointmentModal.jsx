import { useState } from 'react';
import { Modal, Form, DatePicker, Select, message, Input } from 'antd';
import dayjs from 'dayjs';
import { rescheduleAppointment } from '../../services/booking.service';

const { TextArea } = Input;

const RescheduleAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        appointmentId: appointment.appointmentId,
        desiredDate: dayjs(values.date).format('YYYY-MM-DD'),
        desiredTime: values.time, // Already in HH:mm format from Select
        reason: values.reason || '',
      };

      await rescheduleAppointment(payload);

      message.success('Đã thay đổi lịch hẹn thành công!');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Reschedule error:', error);
      message.error(error?.message || 'Không thể thay đổi lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Disable dates before tomorrow
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // Time slots (8:00 - 17:00, every 30 minutes)
  const timeSlots = [];
  for (let hour = 8; hour < 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return (
    <Modal
      title="Thay đổi lịch hẹn tiêm chủng"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xác nhận thay đổi"
      cancelText="Hủy"
      width={600}
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-600">Lịch hẹn hiện tại:</span>
          </div>
          <div className="font-medium">
            Mũi {appointment.doseNumber} -{' '}
            {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')} lúc{' '}
            {appointment.scheduledTime}
          </div>
          <div className="text-gray-600">📍 {appointment.centerName}</div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(appointment.scheduledDate),
          time: appointment.scheduledTime,
        }}
      >
        <Form.Item
          label="Ngày tiêm mới"
          name="date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm' }]}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            placeholder="Chọn ngày tiêm"
          />
        </Form.Item>

        <Form.Item
          label="Giờ tiêm mới"
          name="time"
          rules={[{ required: true, message: 'Vui lòng chọn giờ tiêm' }]}
        >
          <Select
            placeholder="Chọn giờ tiêm"
            options={timeSlots.map((time) => ({
              label: time,
              value: time,
            }))}
          />
        </Form.Item>

        <Form.Item label="Lý do thay đổi (tùy chọn)" name="reason">
          <TextArea
            rows={3}
            placeholder="Nhập lý do bạn muốn thay đổi lịch hẹn..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-800 mb-2">📌 Lưu ý:</div>
          <div>• Chỉ có thể đổi lịch sang ngày trong tương lai</div>
          <div>• Vui lòng chọn thời gian trong giờ làm việc (8:00 - 17:00)</div>
          <div>
            • Lịch hẹn sẽ được giữ nguyên tại trung tâm:{' '}
            <strong>{appointment.centerName}</strong>
          </div>
          <div>• Sau khi thay đổi, vui lòng kiểm tra lại thông tin xác nhận</div>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleAppointmentModal;
