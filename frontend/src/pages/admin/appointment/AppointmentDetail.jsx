import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Descriptions, Row, Space, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { callGetAppointmentById } from '@/services/appointment.service';

const AppointmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await callGetAppointmentById(id);
      if (res?.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Typography.Text>Appointment not found</Typography.Text>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'orange',
    SCHEDULED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RESCHEDULE: 'purple',
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/appointments')}>
          Back to List
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} md={16}>
          <Card title="Appointment Information" className="h-full">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Appointment ID">
                <span className="font-mono">{data.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[data.appointmentStatus]}>{data.appointmentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Date">
                <CalendarOutlined className="mr-2 text-blue-500" />
                {dayjs(data.scheduledDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Time Slot">
                {data.scheduledTimeSlot}
                {data.actualScheduledTime && ` (Actual: ${data.actualScheduledTime})`}
              </Descriptions.Item>
              <Descriptions.Item label="Vaccine">
                <Space>
                  <MedicineBoxOutlined className="text-green-500" />
                  <span className="font-medium">{data.vaccineName}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Dose Number">
                <Badge count={data.doseNumber} style={{ backgroundColor: '#108ee9' }} />
              </Descriptions.Item>
              <Descriptions.Item label="Center">
                <EnvironmentOutlined className="mr-2 text-red-500" />
                {data.centerName}
                {data.centerAddress && (
                  <div className="text-xs text-gray-500 ml-6">{data.centerAddress}</div>
                )}
              </Descriptions.Item>
              {data.doctorName && (
                <Descriptions.Item label="Doctor">
                  <Space>
                    <UserOutlined />
                    {data.doctorName}
                  </Space>
                </Descriptions.Item>
              )}
              {data.cashierName && (
                <Descriptions.Item label="Cashier">
                  <Space>
                    <UserOutlined />
                    {data.cashierName}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col span={24} md={8}>
          <Space direction="vertical" className="w-full" size={24}>
            <Card title="Patient Information">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {data.patientName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{data.patientName}</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <PhoneOutlined /> {data.patientPhone}
                    </div>
                  </div>
                </div>
                {data.patientEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MailOutlined /> {data.patientEmail}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Payment Details">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Method">
                  <Tag>{data.paymentMethod || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={data.paymentStatus === 'SUCCESS' ? 'green' : 'orange'}>
                    {data.paymentStatus || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  <span className="font-bold text-lg text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(data.paymentAmount || 0)}
                  </span>
                </Descriptions.Item>
                {data.paymentId && (
                  <Descriptions.Item label="Payment ID">
                    <span className="font-mono text-xs">{data.paymentId}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentDetailPage;
