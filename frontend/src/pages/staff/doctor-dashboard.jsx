import {
  BellOutlined,
  CalendarOutlined,
  CalendarTwoTone,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  StarFilled,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  message,
  Progress,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { callGetTodayAppointments } from '../../services/appointment.service';
import { useAccountStore } from '../../stores/useAccountStore';
import { formatAppointmentTime } from '../../utils/appointment';

const { Title, Text } = Typography;

const DoctorDashboard = () => {
  const user = useAccountStore((state) => state.user);
  const [viewMode, setViewMode] = useState('today');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const res = await callGetTodayAppointments();
      if (res?.data) {
        setTodayAppointments(res.data);
      }
    } catch (_err) {
      message.error('Không thể tải danh sách lịch hẹn hôm nay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    // Auto refresh every 2 minutes
    const interval = setInterval(fetchTodayAppointments, 120000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics from real data
  const _completedCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;
  const scheduledCount = todayAppointments.filter((a) => a.status === 'SCHEDULED').length;
  const _cancelledCount = todayAppointments.filter((a) => a.status === 'CANCELLED').length;

  const nextAppointment = todayAppointments
    .filter((a) => a.status === 'SCHEDULED')
    .sort((a, b) => formatAppointmentTime(a).localeCompare(formatAppointmentTime(b)))[0];

  // Mock doctor info (can be replaced with real data later)
  const doctorInfo = {
    name: user?.fullName || 'Bác sĩ',
    specialty: 'Bác sĩ',
    rating: 4.8,
    todayAppointments: todayAppointments.length,
    weekAppointments: 18,
    monthCompleted: 45,
    nextAppointment: nextAppointment
      ? {
          time: formatAppointmentTime(nextAppointment),
          patient: nextAppointment.patientName,
          vaccine: nextAppointment.vaccineName,
        }
      : null,
  };

  // Weekly statistics
  const weeklyStats = {
    completed: { value: 15, total: 18, percentage: 83 },
    inProgress: { value: 2, total: 18, percentage: 11 },
    cancelled: { value: 1, total: 18, percentage: 6 },
  };

  // Get status config - map backend status to UI
  const getStatusConfig = (status) => {
    const configs = {
      COMPLETED: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
      IN_PROGRESS: { color: 'warning', text: 'Đang tiêm', icon: <ClockCircleOutlined /> },
      SCHEDULED: { color: 'default', text: 'Chờ tiêm', icon: <ClockCircleOutlined /> },
      CANCELLED: { color: 'error', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
      RESCHEDULE: { color: 'warning', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
    };
    return configs[status] || configs.SCHEDULED;
  };

  // Map appointment to display format
  const mapAppointment = (apt) => ({
    id: apt.id,
    time: formatAppointmentTime(apt),
    patient: apt.patientName,
    phone: apt.patientPhone || 'N/A',
    vaccine: apt.vaccineName,
    vaccineColor: 'blue', // Can be dynamic based on vaccine type
    notes: apt.notes || 'Không có ghi chú',
    status: apt.status,
    urgent: apt.status === 'RESCHEDULE' || false,
  });

  // Handle view appointment
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  // Handle start appointment
  const handleStartAppointment = (appointment) => {
    Modal.confirm({
      title: 'Bắt đầu tiêm chủng',
      content: `Xác nhận bắt đầu tiêm cho bệnh nhân ${appointment.patient}?`,
      okText: 'Bắt đầu',
      cancelText: 'Hủy',
      onOk: () => {
        message.success(`Đã bắt đầu lịch hẹn ${appointment.id}`);
      },
    });
  };

  // Handle complete appointment
  const handleCompleteAppointment = (appointment) => {
    Modal.confirm({
      title: 'Hoàn thành lịch hẹn',
      content: `Xác nhận hoàn thành lịch hẹn ${appointment.id} cho bệnh nhân ${appointment.patient}?`,
      okText: 'Hoàn thành',
      cancelText: 'Hủy',
      onOk: () => {
        message.success(`✓ Đã hoàn thành lịch hẹn ${appointment.id}`);
      },
    });
  };

  // Handle cancel appointment
  const handleCancelAppointment = (appointment) => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: (
        <div>
          <p>Bạn có chắc muốn hủy lịch hẹn {appointment.id}?</p>
          <p>
            Bệnh nhân: <strong>{appointment.patient}</strong>
          </p>
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: () => {
        message.warning(`Đã hủy lịch hẹn ${appointment.id}`);
      },
    });
  };

  // Render appointment card
  const renderAppointmentCard = (apt) => {
    const appointment = mapAppointment(apt);
    const statusConfig = getStatusConfig(appointment.status);
    const isCompleted = appointment.status === 'COMPLETED';
    const isInProgress = appointment.status === 'IN_PROGRESS';
    const isPending = appointment.status === 'SCHEDULED';

    return (
      <Col xs={24} md={12} key={appointment.id}>
        <Card
          hoverable={!isCompleted}
          style={{
            borderLeft: appointment.urgent ? '4px solid #ff4d4f' : '4px solid #1890ff',
            height: '100%',
          }}
        >
          <Row justify="space-between" align="top" style={{ marginBottom: '12px' }}>
            <Col>
              <Space orientation="vertical" size={0}>
                <Space>
                  <ClockCircleOutlined
                    style={{ color: appointment.urgent ? '#ff4d4f' : '#1890ff' }}
                  />
                  <Text strong style={{ fontSize: '15px' }}>
                    {appointment.time}
                  </Text>
                </Space>
                <Title level={5} style={{ margin: '8px 0' }}>
                  {appointment.patient}
                </Title>
              </Space>
            </Col>
            <Col>
              <Badge status={statusConfig.color} text={statusConfig.text} />
            </Col>
          </Row>

          <Space
            orientation="vertical"
            size="small"
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <Space>
              <PhoneOutlined />
              <Text type="secondary">{appointment.phone}</Text>
            </Space>
            <Space>
              <MedicineBoxOutlined />
              <Tag color={appointment.vaccineColor}>{appointment.vaccine}</Tag>
            </Space>
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <i>💬 {appointment.notes}</i>
              </Text>
            </Space>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          <Space wrap>
            {isPending && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartAppointment(appointment)}
                >
                  Bắt đầu
                </Button>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewAppointment(appointment)}
                >
                  Chi tiết
                </Button>
              </>
            )}
            {isInProgress && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleCompleteAppointment(appointment)}
                >
                  Hoàn thành
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelAppointment(appointment)}
                >
                  Hủy
                </Button>
              </>
            )}
            {isCompleted && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewAppointment(appointment)}
              >
                Chi tiết
              </Button>
            )}
          </Space>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: '24px',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '30px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ background: 'rgba(255,255,255,0.3)' }}
              />
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  Dashboard Bác Sĩ
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                  BS. {doctorInfo.name} - {doctorInfo.specialty}
                </Text>
              </div>
            </Space>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Space orientation="vertical" size={0}>
              <Title level={4} style={{ color: 'white', margin: 0 }}>
                {dayjs().format('DD MMMM, YYYY')}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{dayjs().format('dddd')}</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* View Mode Selector */}
      <Card style={{ marginBottom: '24px' }}>
        <Space
          size="large"
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'Hôm nay', value: 'today', icon: <CalendarOutlined /> },
              { label: 'Tuần này', value: 'week', icon: <CalendarTwoTone /> },
            ]}
          />
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Today's Appointments */}
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Lịch Hôm Nay"
              value={doctorInfo.todayAppointments}
              suffix="bệnh nhân"
              styles={{ content: { color: '#1890ff', fontSize: '32px' } }}
              prefix={<CalendarOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <ClockCircleOutlined /> Còn {scheduledCount} lịch chưa hoàn thành
            </Text>
          </Card>
        </Col>

        {/* This Week */}
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tuần Này"
              value={doctorInfo.weekAppointments}
              suffix="bệnh nhân"
              styles={{ content: { color: '#13c2c2', fontSize: '32px' } }}
              prefix={<CalendarTwoTone />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CheckCircleOutlined /> Đã xếp lịch
            </Text>
          </Card>
        </Col>

        {/* Completed */}
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã Hoàn Thành"
              value={doctorInfo.monthCompleted}
              suffix="trong tháng"
              styles={{ content: { color: '#52c41a', fontSize: '32px' } }}
              prefix={<CheckCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <StarFilled style={{ color: '#faad14' }} /> Hiệu suất tốt
            </Text>
          </Card>
        </Col>

        {/* Next Appointment */}
        <Col xs={12} sm={12} md={6}>
          <Card>
            {doctorInfo.nextAppointment ? (
              <>
                <Statistic
                  title="Lịch Tiếp Theo"
                  value={doctorInfo.nextAppointment.time}
                  suffix="hôm nay"
                  styles={{ content: { color: '#faad14', fontSize: '32px' } }}
                  prefix={<BellOutlined />}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <UserOutlined /> {doctorInfo.nextAppointment.patient} -{' '}
                  {doctorInfo.nextAppointment.vaccine}
                </Text>
              </>
            ) : (
              <Statistic
                title="Lịch Tiếp Theo"
                value="N/A"
                styles={{ content: { color: '#999', fontSize: '32px' } }}
                prefix={<BellOutlined />}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Today's Schedule */}
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '18px' }}>
              Lịch Hôm Nay - {dayjs().format('DD/MM/YYYY')}
            </Text>
          </Space>
        }
        extra={
          <Button icon={<CalendarOutlined />} onClick={fetchTodayAppointments} loading={loading}>
            Làm mới
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" spinning tip="Đang tải lịch hẹn...">
              <div style={{ minHeight: 100 }} />
            </Spin>
          </div>
        ) : todayAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Không có lịch hẹn hôm nay</Title>
            <Text type="secondary">Bạn có thể nghỉ ngơi hoặc xem lịch hẹn khác</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {todayAppointments.map((appointment) => renderAppointmentCard(appointment))}
          </Row>
        )}
      </Card>

      {/* Statistics Row */}
      <Row gutter={[16, 16]}>
        {/* Weekly Statistics */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <MedicineBoxOutlined />
                <Text strong>Thống Kê Tuần Này</Text>
              </Space>
            }
          >
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Text>Hoàn thành</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {weeklyStats.completed.value}/{weeklyStats.completed.total} (
                    {weeklyStats.completed.percentage}%)
                  </Text>
                </Row>
                <Progress
                  percent={weeklyStats.completed.percentage}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>

              <div>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Text>Đang xử lý</Text>
                  <Text strong style={{ color: '#faad14' }}>
                    {weeklyStats.inProgress.value}/{weeklyStats.inProgress.total} (
                    {weeklyStats.inProgress.percentage}%)
                  </Text>
                </Row>
                <Progress
                  percent={weeklyStats.inProgress.percentage}
                  strokeColor="#faad14"
                  showInfo={false}
                />
              </div>

              <div>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Text>Đã hủy</Text>
                  <Text strong style={{ color: '#ff4d4f' }}>
                    {weeklyStats.cancelled.value}/{weeklyStats.cancelled.total} (
                    {weeklyStats.cancelled.percentage}%)
                  </Text>
                </Row>
                <Progress
                  percent={weeklyStats.cancelled.percentage}
                  strokeColor="#ff4d4f"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Monthly Performance */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <Text strong>Hiệu Suất Tháng Này</Text>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={1} style={{ color: '#52c41a', margin: 0 }}>
                {doctorInfo.monthCompleted}
              </Title>
              <Text type="secondary">Bệnh nhân đã tiêm</Text>
            </div>

            <Divider />

            <Row gutter={16} style={{ textAlign: 'center' }}>
              <Col span={8}>
                <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                  95%
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tỷ lệ hoàn thành
                </Text>
              </Col>
              <Col span={8}>
                <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                  {doctorInfo.rating}
                  <StarFilled style={{ color: '#faad14', fontSize: '20px', marginLeft: '4px' }} />
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Đánh giá TB
                </Text>
              </Col>
              <Col span={8}>
                <Title level={4} style={{ color: '#13c2c2', margin: 0 }}>
                  2
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Hủy lịch
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <Text strong>Chi Tiết Lịch Hẹn</Text>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          selectedAppointment?.status === 'pending' && (
            <Button
              key="start"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                handleStartAppointment(selectedAppointment);
                setDetailModalOpen(false);
              }}
            >
              Bắt đầu tiêm
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã lịch hẹn">
              <Text strong>#{selectedAppointment.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              <Space>
                <ClockCircleOutlined />
                <Text>{selectedAppointment.time}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text strong>{selectedAppointment.patient}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                <Text>{selectedAppointment.phone}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Loại vắc-xin">
              <Tag color={selectedAppointment.vaccineColor} icon={<MedicineBoxOutlined />}>
                {selectedAppointment.vaccine}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={getStatusConfig(selectedAppointment.status).color}
                text={getStatusConfig(selectedAppointment.status).text}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              <Text>{selectedAppointment.notes}</Text>
            </Descriptions.Item>
            {selectedAppointment.urgent && (
              <Descriptions.Item label="Ưu tiên">
                <Tag color="red">GẤP</Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
