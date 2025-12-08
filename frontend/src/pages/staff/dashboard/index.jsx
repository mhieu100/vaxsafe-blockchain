import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  RightOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  List,
  Modal,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  callGetTodayAppointments,
  callGetUrgentAppointments,
} from '@/services/appointment.service';
import dashboardService from '@/services/dashboard.service';
import { useAccountStore } from '@/stores/useAccountStore';
import ProcessUrgentAppointmentModal from './components/ProcessUrgentAppointmentModal';
import UrgencyGuide from './components/UrgencyGuide';

const { Title, Text } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = useAccountStore((state) => state.user);
  const isCashierRole = user?.role === 'CASHIER';
  const isDoctorRole = user?.role === 'DOCTOR';

  const [urgentAppointments, setUrgentAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchUrgentAppointments = async () => {
    try {
      setLoading(true);
      const [urgentRes, statsRes] = await Promise.all([
        callGetUrgentAppointments(),
        dashboardService.getCashierStats(),
      ]);
      if (urgentRes?.data) {
        setUrgentAppointments(urgentRes.data);
        setError(null);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (_err) {
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setLoadingToday(true);
      const [todayRes, statsRes] = await Promise.all([
        callGetTodayAppointments(),
        dashboardService.getDoctorStats(),
      ]);
      if (todayRes?.data) {
        // setTodayAppointments(todayRes.data);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (_err) {
      // Handle error
    } finally {
      setLoadingToday(false);
    }
  };

  // Fetch data based on role
  useEffect(() => {
    const fetchData = async () => {
      if (isCashierRole) {
        await fetchUrgentAppointments();
      } else if (isDoctorRole) {
        await fetchTodayAppointments();
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [isCashierRole, isDoctorRole]);

  const handleAssignAppointment = (appointment) => {
    // Open modal to process the urgent appointment
    setSelectedAppointment(appointment);
    setProcessModalOpen(true);
  };

  const getUrgencyIcon = (urgencyType) => {
    const icons = {
      RESCHEDULE_PENDING: <ExclamationCircleOutlined />,
      NO_DOCTOR: <WarningOutlined />,
      COMING_SOON: <ClockCircleOutlined />,
      OVERDUE: <CloseCircleOutlined />,
    };
    return icons[urgencyType] || <InfoCircleOutlined />;
  };

  const getUrgencyColor = (priorityLevel) => {
    const colors = {
      1: 'red', // Highest priority
      2: 'orange', // High priority
      3: 'gold', // Medium priority
      4: 'blue', // Low priority
      5: 'default', // Lowest priority
    };
    return colors[priorityLevel] || 'default';
  };

  const getPriorityText = (priorityLevel) => {
    const texts = {
      1: 'CỰC KHẨN',
      2: 'KHẨN',
      3: 'CAO',
      4: 'TRUNG BÌNH',
      5: 'THẤP',
    };
    return texts[priorityLevel] || 'THẤP';
  };

  // Render Cashier Dashboard
  const renderCashierDashboard = () => (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Xin chào, {user?.fullName} 👋
            </Title>
            <Text type="secondary">Trung tâm: {user?.centerName || 'Trung tâm tiêm chủng'}</Text>
          </Col>
          <Col>
            <Space>
              <Card size="small" style={{ borderRadius: 8 }}>
                <Space>
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{dayjs().format('DD/MM/YYYY')}</Text>
                </Space>
              </Card>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={fetchUrgentAppointments}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Cần Xử Lý Gấp"
              value={stats?.urgentAppointments || 0}
              prefix={<ThunderboltOutlined style={{ color: '#ff4d4f' }} />}
              suffix="lịch hẹn"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress
              percent={stats?.urgentAppointments > 0 ? 100 : 0}
              size="small"
              status="exception"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ưu tiên xử lý ngay
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Đã Xếp Hôm Nay"
              value={stats?.todayAppointments || 0}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              suffix="lịch hẹn"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={70} // Mock percentage or calculate if possible
              size="small"
              strokeColor="#1890ff"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tiến độ trong ngày
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Hoàn Thành Tuần"
              value={stats?.weekCompleted || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="lịch hẹn"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={85}
              size="small"
              strokeColor="#52c41a"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiệu suất tốt
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title="Đã Hủy Tuần"
              value={stats?.weekCancelled || 0}
              prefix={<CloseCircleOutlined style={{ color: '#faad14' }} />}
              suffix="lịch hẹn"
              valueStyle={{ color: '#faad14' }}
            />
            <Progress
              percent={15}
              size="small"
              strokeColor="#faad14"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tỷ lệ hủy thấp
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Main Content: Urgent Appointments */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <Badge count={urgentAppointments.length} offset={[10, 0]}>
                  <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />
                </Badge>
                <Text strong style={{ fontSize: 16 }}>
                  Danh Sách Cần Xử Lý
                </Text>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/staff/pending-appointments')}>
                Xem tất cả <RightOutlined />
              </Button>
            }
            style={{ borderRadius: 12, minHeight: 500 }}
          >
            {error && (
              <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
            )}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
              </div>
            ) : urgentAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4}>Không có việc gấp!</Title>
                <Text type="secondary">Hệ thống đang hoạt động ổn định.</Text>
              </div>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={urgentAppointments}
                renderItem={(item) => (
                  <Card
                    hoverable
                    style={{
                      marginBottom: 16,
                      borderLeft: `4px solid ${getUrgencyColor(item.priorityLevel)}`,
                      background: item.priorityLevel <= 2 ? '#fffcf0' : '#fff',
                    }}
                    actions={[
                      <Button
                        key="process"
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => handleAssignAppointment(item)}
                      >
                        Xử Lý Ngay
                      </Button>,
                      <Button key="view" onClick={() => navigate(`/staff/appointments/${item.id}`)}>
                        Xem Chi Tiết
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge
                          count={item.priorityLevel}
                          style={{ backgroundColor: getUrgencyColor(item.priorityLevel) }}
                        >
                          <Avatar
                            size={54}
                            icon={getUrgencyIcon(item.urgencyType)}
                            style={{
                              backgroundColor: '#f0f2f5',
                              color: getUrgencyColor(item.priorityLevel),
                            }}
                          />
                        </Badge>
                      }
                      title={
                        <Row justify="space-between">
                          <Space>
                            <Text strong style={{ fontSize: 16 }}>
                              #{item.id} - {item.patientName}
                            </Text>
                            <Tag color={getUrgencyColor(item.priorityLevel)}>
                              {getPriorityText(item.priorityLevel)}
                            </Tag>
                            {item.urgencyType === 'RESCHEDULE_PENDING' && (
                              <Tag color="purple">ĐỔI LỊCH</Tag>
                            )}
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.scheduledDate).format('DD/MM/YYYY')}
                          </Text>
                        </Row>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                          <Space wrap>
                            <Tag icon={<PhoneOutlined />}>{item.patientPhone}</Tag>
                            <Tag color="blue">{item.vaccineName}</Tag>
                            <Tag>Mũi {item.doseNumber}</Tag>
                          </Space>

                          <Alert
                            message={item.urgencyMessage}
                            type={item.priorityLevel === 1 ? 'error' : 'warning'}
                            showIcon
                            style={{ marginTop: 8 }}
                          />

                          {item.desiredDate && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong type="danger">
                                <ClockCircleOutlined /> Mong muốn đổi sang:{' '}
                                {dayjs(item.desiredDate).format('DD/MM/YYYY')} {item.desiredTime}
                              </Text>
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Sidebar: Quick Actions & Guide */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                <Text strong>Thao Tác Nhanh</Text>
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 24 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/staff/calendar-view')}
              >
                Xem Lịch Bác Sĩ
              </Button>
              <Button
                block
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={() => navigate('/staff/pending-appointments')}
              >
                Danh Sách Chờ
              </Button>
              <Button
                block
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => navigate('/staff/appointments?status=assigned')}
              >
                Đã Phân Công
              </Button>
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#faad14' }} />
                <Text strong>Hướng Dẫn Ưu Tiên</Text>
              </Space>
            }
            extra={
              <Button type="link" size="small" onClick={() => setShowGuideModal(true)}>
                Chi tiết
              </Button>
            }
            style={{ borderRadius: 12 }}
          >
            <Timeline
              items={[
                {
                  color: 'red',
                  dot: <ExclamationCircleOutlined />,
                  children: <Text strong>Priority 1: Cực Khẩn (Đổi lịch, &lt; 24h)</Text>,
                },
                {
                  color: 'orange',
                  dot: <WarningOutlined />,
                  children: <Text>Priority 2: Khẩn (Quá hạn xử lý)</Text>,
                },
                {
                  color: 'gold',
                  children: 'Priority 3: Cao (Sắp đến giờ)',
                },
                {
                  color: 'blue',
                  children: 'Priority 4: Thường',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <Modal
        open={showGuideModal}
        onCancel={() => setShowGuideModal(false)}
        footer={null}
        width={800}
      >
        <UrgencyGuide />
      </Modal>

      {selectedAppointment && (
        <ProcessUrgentAppointmentModal
          open={processModalOpen}
          onClose={() => {
            setProcessModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setProcessModalOpen(false);
            setSelectedAppointment(null);
            fetchUrgentAppointments();
          }}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );

  // Redirect doctor to their dashboard
  useEffect(() => {
    if (isDoctorRole) {
      navigate('/staff/dashboard-doctor');
    }
  }, [isDoctorRole, navigate]);

  // Render Doctor Dashboard (Fallback or Simple View if not using dedicated component)
  const renderDoctorDashboard = () => {
    return (
      <div
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="Đang chuyển hướng đến Dashboard Bác sĩ..." />
      </div>
    );
  };

  return isCashierRole ? renderCashierDashboard() : renderDoctorDashboard();
};

export default StaffDashboard;
