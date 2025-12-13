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
import { useEffect, useState } from 'react';
import { callCompleteAppointment } from '@/services/appointment.service';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const CompletionModal = ({ open, onCancel, appointment, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [patientConsentSignature, setPatientConsentSignature] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setDoctorSignature(null);
      setPatientConsentSignature(null);
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue(true);

      const payload = {
        height: values.height,
        weight: values.weight,
        temperature: values.temperature,
        pulse: values.heartRate,

        site: values.site || 'LEFT_ARM',
        notes: values.temperatureNote,

        adverseReactions: values.reaction ? `${values.reactionType}: ${values.reaction}` : null,

        // Include Signatures
        doctorSignature: doctorSignature,
        patientConsentSignature: patientConsentSignature,
      };

      await callCompleteAppointment(appointment.id, payload);

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
    } catch (_err) {}
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const handleDoctorSign = () => {
    // Mocking a digital signature generation
    const mockSig = `DOC_SIG_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`;
    setDoctorSignature(mockSig);
    message.success('Bác sĩ đã ký xác nhận điện tử!');
  };

  const handlePatientConsent = () => {
    // Mocking patient consent signature
    const mockSig = `PAT_CONSENT_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`;
    setPatientConsentSignature(mockSig);
    message.success('Bệnh nhân đã xác nhận đồng thuận!');
  };

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
      title: 'Thông tin & Phản ứng',
      icon: <ExperimentOutlined />,
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="heartRate" label="Nhịp tim (bpm)">
                <InputNumber style={{ width: '100%' }} placeholder="VD: 80" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="site" label="Vị trí tiêm" initialValue="LEFT_ARM">
                <Select>
                  <Option value="LEFT_ARM">Bắp tay trái</Option>
                  <Option value="RIGHT_ARM">Bắp tay phải</Option>
                  <Option value="LEFT_THIGH">Đùi trái</Option>
                  <Option value="RIGHT_THIGH">Đùi phải</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Theo dõi sau tiêm</Divider>

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
      title: 'Chữ ký số',
      icon: <CheckCircleOutlined />, // Using check circle as placeholder, maybe Swap with KeyOutlined if available but staying safe
      content: (
        <Card bordered={false}>
          <Title level={5}>1. Chữ ký Bác sĩ (Doctor Signature)</Title>
          <Alert
            message="Xác nhận chuyên môn và chịu trách nhiệm y tế."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {doctorSignature ? (
              <Button
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                icon={<CheckCircleOutlined />}
              >
                Đã ký điện tử
              </Button>
            ) : (
              <Button type="primary" onClick={handleDoctorSign}>
                Ký xác nhận ngay
              </Button>
            )}
            <span style={{ marginLeft: 12, color: '#888' }}>
              {doctorSignature ? 'Mã ký: ' + doctorSignature.substring(0, 20) + '...' : 'Chưa ký'}
            </span>
          </div>

          <Divider />

          <Title level={5}>2. Đồng thuận của Bệnh nhân (Patient Consent)</Title>
          <Alert
            message="Xác nhận bệnh nhân đã nghe tư vấn và đồng ý tiêm."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {patientConsentSignature ? (
              <Button
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                icon={<CheckCircleOutlined />}
              >
                Đã đồng thuận
              </Button>
            ) : (
              <Button onClick={handlePatientConsent}>Xác nhận đồng ý</Button>
            )}
            <span style={{ marginLeft: 12, color: '#888' }}>
              {patientConsentSignature
                ? 'Mã ký: ' + patientConsentSignature.substring(0, 20) + '...'
                : 'Chưa xác nhận'}
            </span>
          </div>
        </Card>
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
          <div
            style={{
              textAlign: 'left',
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <p>
              <strong>Bác sĩ ký:</strong>{' '}
              {doctorSignature ? (
                <span style={{ color: 'green' }}>Đã ký</span>
              ) : (
                <span style={{ color: 'red' }}>Chưa ký</span>
              )}
            </p>
            <p>
              <strong>Bệnh nhân đồng thuận:</strong>{' '}
              {patientConsentSignature ? (
                <span style={{ color: 'green' }}>Đã xác nhận</span>
              ) : (
                <span style={{ color: 'red' }}>Chưa xác nhận</span>
              )}
            </p>
          </div>
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
              disabled={!doctorSignature || !patientConsentSignature} // Enforce signatures
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
