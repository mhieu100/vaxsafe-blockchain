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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />
                <Text strong style={{ fontSize: 18 }}>
                  Danh Sách Cần Xử Lý
                </Text>
                <Text
                  style={{ textAlign: 'center', marginLeft: 8, fontSize: 12, color: '#faad14' }}
                >
                  ({urgentAppointments.length} trường hợp)
                </Text>
              </div>
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
                      marginBottom: 12, // Reduced margin
                      borderLeft: `4px solid ${getUrgencyColor(item.priorityLevel)}`,
                      borderRadius: 8,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                    bodyStyle={{ padding: '12px 16px' }} // Compact padding
                    actions={[
                      <Button
                        key="process"
                        type="primary"
                        size="small" // Small button
                        icon={<ThunderboltOutlined />}
                        style={{ minWidth: 100, borderRadius: 4 }}
                        onClick={() => handleAssignAppointment(item)}
                      >
                        Xử Lý
                      </Button>,
                      <Button
                        key="view"
                        size="small" // Small button
                        style={{ minWidth: 100, borderRadius: 4 }}
                        onClick={() => navigate(`/staff/appointments/${item.id}`)}
                      >
                        Chi Tiết
                      </Button>,
                    ]}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      {/* Compact Icon Block */}
                      <div style={{ marginRight: 12, marginTop: 2 }}>
                        <Badge
                          count={item.priorityLevel}
                          offset={[-2, 4]}
                          style={{ backgroundColor: '#ff4d4f', boxShadow: '0 0 0 1px #fff' }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40, // Smaller size
                              borderRadius: '50%',
                              background: '#fff1f0',
                              border: '1px solid #ffccc7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getUrgencyIcon(item.urgencyType)}
                          </div>
                        </Badge>
                      </div>

                      {/* Content Block */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Line 1: Header & Date */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <Space size={6} wrap style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              strong
                              style={{
                                fontSize: 15,
                                color: '#262626',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              #{item.id} – {item.patientName}
                            </Text>
                            <Tag
                              color={getUrgencyColor(item.priorityLevel)}
                              style={{ margin: 0, padding: '0 4px', fontSize: 10, fontWeight: 700 }}
                            >
                              {getPriorityText(item.priorityLevel)}
                            </Tag>
                            {item.urgencyType === 'RESCHEDULE_PENDING' && (
                              <Tag
                                color="purple"
                                style={{ margin: 0, padding: '0 4px', fontSize: 10 }}
                              >
                                ĐỔI LỊCH
                              </Tag>
                            )}
                          </Space>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, marginLeft: 8, whiteSpace: 'nowrap' }}
                          >
                            {dayjs(item.scheduledDate).format('DD/MM/YYYY')}
                          </Text>
                        </div>

                        {/* Line 2: Tags & Alert mixed inline */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Tag
                            style={{
                              margin: 0,
                              padding: '0 6px',
                              fontSize: 11,
                              border: 'none',
                              background: '#f0f0f0',
                            }}
                          >
                            <PhoneOutlined /> {item.patientPhone}
                          </Tag>
                          <Tag color="blue" style={{ margin: 0, padding: '0 6px', fontSize: 11 }}>
                            {item.vaccineName}
                          </Tag>
                          <Tag style={{ margin: 0, padding: '0 6px', fontSize: 11 }}>
                            Mũi {item.doseNumber || 1}
                          </Tag>

                          {/* Inline Alert Message */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              color: '#ff4d4f',
                              fontSize: 12,
                            }}
                          >
                            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                            <Text type="danger" style={{ fontSize: 12 }} ellipsis>
                              {item.urgencyMessage || 'Cần xử lý'}
                            </Text>
                          </div>
                        </div>

                        {/* Line 3: Desired Date (Only if exists) */}
                        {item.desiredDate && (
                          <div style={{ fontSize: 12, color: '#cf1322', marginTop: 2 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            <strong>Đổi sang:</strong>{' '}
                            {dayjs(item.desiredDate).format('DD/MM/YYYY')} {item.desiredTime}
                          </div>
                        )}
                      </div>
                    </div>
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
