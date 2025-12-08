import {
  CheckCircleOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Select,
  Steps,
  Typography,
} from 'antd';
import { useState } from 'react';
import { callCompleteAppointment } from '@/services/appointment.service';
import { createObservationForPatient } from '@/services/observation.service';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const CompletionModal = ({ open, onCancel, appointment, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Helper to submit a single observation
  const submitObservation = async (type, value, unit, note) => {
    if (!value) return;

    // Ensure we have a valid patient ID
    if (!appointment?.patientId) {
      console.error('Missing patient ID for observation', appointment);
      return;
    }

    try {
      await createObservationForPatient(appointment.patientId, {
        type,
        value: value.toString(),
        unit,
        note,
        appointmentId: appointment.id,
      });
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      // Don't throw here to allow other observations to proceed,
      // but we might want to track failures
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 1. Submit VITALS (Parallel)
      const observationPromises = [
        submitObservation('BODY_WEIGHT', values.weight, 'kg', 'Ghi nhận tại thời điểm tiêm'),
        submitObservation('BODY_HEIGHT', values.height, 'cm', 'Ghi nhận tại thời điểm tiêm'),
        submitObservation('BODY_TEMPERATURE', values.temperature, '°C', values.temperatureNote),
        submitObservation('BLOOD_PRESSURE', values.bloodPressure, 'mmHg', ''),
        submitObservation('HEART_RATE', values.heartRate, 'bpm', ''),
      ];

      // 2. Submit REACTION if any
      if (values.reaction) {
        observationPromises.push(
          submitObservation(
            'REMOVE_REACTION',
            values.reactionType || 'Phản ứng khác',
            '',
            values.reaction
          )
        );
      }

      await Promise.all(observationPromises);

      // 3. Mark appointment as COMPLETED
      await callCompleteAppointment(appointment.id);

      message.success('Đã hoàn thành tiêm chủng và ghi nhận chỉ số!');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (_err) {
      // Form validation failed
    }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const steps = [
    {
      title: 'Chỉ số sinh tồn',
      icon: <DashboardOutlined />,
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="Cập nhật chỉ số sức khỏe"
              description="Hệ thống sẽ tự động cập nhật cân nặng và chiều cao vào hồ sơ bệnh nhân."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="weight"
              label="Cân nặng (kg)"
              rules={[{ required: true, message: 'Nhập cân nặng' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="VD: 60.5" step={0.1} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="height"
              label="Chiều cao (cm)"
              rules={[{ required: true, message: 'Nhập chiều cao' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="VD: 170" step={1} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="temperature" label="Nhiệt độ (°C)">
              <InputNumber style={{ width: '100%' }} placeholder="VD: 36.5" step={0.1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bloodPressure" label="Huyết áp (mmHg)">
              <Input placeholder="VD: 120/80" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Phản ứng & Ghi chú',
      icon: <ExperimentOutlined />,
      content: (
        <>
          <Form.Item name="reactionType" label="Loại phản ứng (nếu có)">
            <Select placeholder="Chọn loại phản ứng">
              <Option value="Không có">Không có</Option>
              <Option value="Sốt nhẹ">Sốt nhẹ</Option>
              <Option value="Đau tại chỗ tiêm">Đau tại chỗ tiêm</Option>
              <Option value="Dị ứng">Dị ứng</Option>
              <Option value="Sốc phản vệ">Sốc phản vệ (Nguy hiểm)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reaction" label="Mô tả chi tiết phản ứng">
            <TextArea rows={3} placeholder="Mô tả chi tiết triệu chứng, thời điểm xuất hiện..." />
          </Form.Item>
          <Form.Item name="temperatureNote" label="Ghi chú khác">
            <TextArea rows={2} placeholder="Ghi chú thêm về quy trình tiêm..." />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Xác nhận',
      icon: <CheckCircleOutlined />,
      content: (
        <Card bordered={false} style={{ textAlign: 'center' }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4}>Xác nhận hoàn thành tiêm chủng</Title>
          <Text>
            Bạn đang xác nhận đã tiêm vắc-xin <strong>{appointment?.vaccine}</strong> cho bệnh nhân{' '}
            <strong>{appointment?.patient}</strong>.
          </Text>
          <Divider />
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="Hành động này không thể hoàn tác"
            description="Vui lòng kiểm tra kỹ các thông tin chỉ số sinh tồn và phản ứng trước khi xác nhận."
          />
        </Card>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Quy trình hoàn thành tiêm chủng"
      width={700}
      footer={null}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        <div style={{ minHeight: '200px' }}>{steps[currentStep].content}</div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={prev}>
              Quay lại
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Tiếp theo
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleFinish}
              loading={loading}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Xác nhận hoàn thành
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CompletionModal;
