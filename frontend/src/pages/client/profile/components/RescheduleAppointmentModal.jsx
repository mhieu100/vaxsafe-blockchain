import { DatePicker, Form, Input, Modal, message, Select } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rescheduleAppointment } from '@/services/booking.service';
import { formatAppointmentTime } from '@/utils/appointment';

const { TextArea } = Input;

const RescheduleAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const { t } = useTranslation(['client']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    { value: 'SLOT_07_00', label: '07:00 - 09:00' },
    { value: 'SLOT_09_00', label: '09:00 - 11:00' },
    { value: 'SLOT_11_00', label: '11:00 - 13:00' },
    { value: 'SLOT_13_00', label: '13:00 - 15:00' },
    { value: 'SLOT_15_00', label: '15:00 - 17:00' },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        appointmentId: appointment.appointmentId,
        desiredDate: dayjs(values.date).format('YYYY-MM-DD'),
        desiredTimeSlot: values.time,
        reason: values.reason || '',
      };

      await rescheduleAppointment(payload);

      message.success(t('client:appointments.rescheduleSuccess'));
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error(error?.message || t('client:appointments.rescheduleFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title={t('client:appointments.rescheduleTitle')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('client:common.confirm')}
      cancelText={t('client:common.cancel')}
      width={600}
    >
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm space-y-2">
          <div className="font-semibold text-yellow-800 mb-2">
            {t('client:appointments.rescheduleWarning')}
          </div>
          <div>
            <span className="text-gray-600">{t('client:appointments.oldSchedule')}:</span>
            <div className="font-medium text-red-600">
              {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')} lúc{' '}
              {formatAppointmentTime(appointment)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">{t('client:appointments.newSchedule')}:</span>
            <div className="font-medium text-green-600">
              {dayjs(appointment.desiredDate || appointment.scheduledDate).format('DD/MM/YYYY')} lúc{' '}
              {appointment.desiredTimeSlot
                ? timeSlots.find((slot) => slot.value === appointment.desiredTimeSlot)?.label ||
                  appointment.desiredTimeSlot
                : formatAppointmentTime(appointment)}
            </div>
          </div>
          <div className="text-gray-600 pt-1 border-t border-yellow-200">
            📍 {appointment.centerName}
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(appointment.scheduledDate),
          time: appointment.scheduledTimeSlot,
        }}
      >
        <Form.Item
          label={t('client:appointments.newDate')}
          name="date"
          rules={[{ required: true, message: t('client:appointments.requireDate') }]}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            placeholder={t('client:appointments.selectDate')}
          />
        </Form.Item>

        <Form.Item
          label={t('client:appointments.newTimeSlot')}
          name="time"
          rules={[{ required: true, message: t('client:appointments.requireTimeSlot') }]}
        >
          <Select placeholder={t('client:appointments.selectTimeSlot')} options={timeSlots} />
        </Form.Item>

        <Form.Item label={t('client:appointments.reason') || 'Reason'} name="reason">
          <TextArea
            rows={3}
            placeholder={t('client:appointments.reasonPlaceholder')}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-800 mb-2">📌 {t('client:common.note')}:</div>
          <div>{t('client:appointments.rescheduleRule1')}</div>
          <div>
            {t('client:appointments.rescheduleRule2')} <strong>{appointment.centerName}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleAppointmentModal;
