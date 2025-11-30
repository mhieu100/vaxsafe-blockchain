import {
  CalendarFilled,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  UserOutlined,
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
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessUrgentAppointmentModal } from '@/components/modal/appointment';
import {
  callGetTodayAppointments,
  callGetUrgentAppointments,
} from '@/services/appointment.service';
import { useAccountStore } from '@/stores/useAccountStore';
import UrgencyGuide from './components/UrgencyGuide';

const { Title, Text } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = useAccountStore((state) => state.user);
  const isCashierRole = user?.role === 'CASHIER';
  const isDoctorRole = user?.role === 'DOCTOR';

  const [urgentAppointments, setUrgentAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);
  const [error, setError] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchUrgentAppointments = async () => {
    try {
      setLoading(true);
      const res = await callGetUrgentAppointments();
      if (res?.data) {
        setUrgentAppointments(res.data);
        setError(null);
      }
    } catch (_err) {
      setError('Không thể tải danh sách lịch hẹn cần xử lý');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setLoadingToday(true);
      const res = await callGetTodayAppointments();
      if (res?.data) {
        setTodayAppointments(res.data);
      }
    } catch (_err) {
    } finally {
      setLoadingToday(false);
    }
  };

  // Fetch urgent appointments for cashier
  useEffect(() => {
    if (isCashierRole) {
      fetchUrgentAppointments();
      // Auto refresh every 2 minutes
      const interval = setInterval(fetchUrgentAppointments, 120000);
      return () => clearInterval(interval);
    }
  }, [isCashierRole, fetchUrgentAppointments]);

  // Fetch today's appointments for doctor
  useEffect(() => {
    if (isDoctorRole) {
      fetchTodayAppointments();
      // Auto refresh every 2 minutes
      const interval = setInterval(fetchTodayAppointments, 120000);
      return () => clearInterval(interval);
    }
  }, [isDoctorRole, fetchTodayAppointments]);

  // Mock data for CASHIER - Pending appointments that need scheduling (fallback)
  const _pendingAppointments = [
    {
      id: 'LH001',
      patientName: 'Nguyễn Văn B',
      phone: '0901234567',
      vaccine: 'COVID-19',
      vaccineType: 'info',
      registeredDate: '12/11/2025 08:30',
      preferredDate: '13/11/2025',
      isUrgent: true,
      status: 'pending',
    },
    {
      id: 'LH002',
      patientName: 'Trần Thị C',
      phone: '0907654321',
      vaccine: 'Cúm',
      vaccineType: 'primary',
      registeredDate: '12/11/2025 09:15',
      preferredDate: '13/11/2025',
      isUrgent: true,
      status: 'pending',
    },
    {
      id: 'LH003',
      patientName: 'Lê Văn D',
      phone: '0912345678',
      vaccine: 'Viêm Gan B',
      vaccineType: 'success',
      registeredDate: '12/11/2025 10:00',
      preferredDate: '14/11/2025',
      isUrgent: false,
      status: 'pending',
    },
    {
      id: 'LH004',
      patientName: 'Phạm Thị E',
      phone: '0923456789',
      vaccine: 'HPV',
      vaccineType: 'warning',
      registeredDate: '12/11/2025 11:20',
      preferredDate: '14/11/2025',
      isUrgent: false,
      status: 'pending',
    },
    {
      id: 'LH005',
      patientName: 'Hoàng Văn F',
      phone: '0934567890',
      vaccine: 'Sởi',
      vaccineType: 'error',
      registeredDate: '12/11/2025 13:45',
      preferredDate: '15/11/2025',
      isUrgent: false,
      status: 'pending',
    },
  ];

  // Mock data for DOCTOR - Upcoming appointments
  const _upcomingAppointments = [
    {
      id: 1,
      patientName: 'Nguyễn Văn A',
      time: '09:00',
      date: '2023-05-15',
      status: 'confirmed',
      vaccine: 'Covid-19',
    },
    {
      id: 2,
      patientName: 'Trần Thị B',
      time: '10:30',
      date: '2023-05-15',
      status: 'pending',
      vaccine: 'Cúm mùa',
    },
    {
      id: 3,
      patientName: 'Lê Văn C',
      time: '14:00',
      date: '2023-05-16',
      status: 'confirmed',
      vaccine: 'Viêm gan B',
    },
  ];

  const _recentVaccinations = [
    {
      id: 1,
      patientName: 'Phạm Thị D',
      date: '2023-05-14',
      vaccine: 'Covid-19',
      dose: 2,
    },
    {
      id: 2,
      patientName: 'Hoàng Văn E',
      date: '2023-05-14',
      vaccine: 'HPV',
      dose: 1,
    },
    {
      id: 3,
      patientName: 'Ngô Thị F',
      date: '2023-05-13',
      vaccine: 'Viêm gan B',
      dose: 3,
    },
  ];

  const handleAssignAppointment = (appointment) => {
    // Open modal to process the urgent appointment
    setSelectedAppointment(appointment);
    setProcessModalOpen(true);
  };

  const _getVaccineColor = (type) => {
    const colors = {
      info: 'blue',
      primary: 'cyan',
      success: 'green',
      warning: 'orange',
      error: 'red',
    };
    return colors[type] || 'default';
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

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            {isCashierRole ? (
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
            ) : (
              <CalendarFilled style={{ color: '#52c41a' }} />
            )}
            Dashboard -
            <Tag
              color={isCashierRole ? 'blue' : 'green'}
              style={{ fontSize: 16, padding: '4px 12px' }}
            >
              {isCashierRole ? 'Nhân viên thu ngân' : 'Bác sĩ'}
            </Tag>
          </Space>
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Chào mừng, {user?.fullName} - {user?.centerName || 'Trung tâm tiêm chủng'}
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
                  <span>Cần Xử Lý Gấp</span>
                </Space>
              }
              value={isCashierRole ? urgentAppointments.length : 12}
              suffix="lịch hẹn"
              valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
              loading={loading}
            />
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ExclamationCircleOutlined /> Ưu tiên cao nhất
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <span>Đã Xếp Hôm Nay</span>
                </Space>
              }
              value={8}
              suffix="lịch hẹn"
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined /> Hôm nay
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Hoàn Thành</span>
                </Space>
              }
              value={25}
              suffix="trong tuần"
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <RiseOutlined /> +12% so với tuần trước
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>Đã Hủy</span>
                </Space>
              }
              value={3}
              suffix="trong tuần"
              valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
            />
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <InfoCircleOutlined /> Xem chi tiết
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Priority Guide - Only for CASHIER */}
      {isCashierRole && (
        <>
          <Card
            style={{ marginBottom: 24 }}
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                <span>Thao Tác Nhanh</span>
              </Space>
            }
          >
            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<ClockCircleOutlined />}
                size="large"
                onClick={() => navigate('/staff/appointments?status=pending')}
              >
                Xem Lịch Chờ Xếp
              </Button>
              <Button
                icon={<CalendarOutlined />}
                size="large"
                onClick={() => navigate('/staff/calendar-view')}
              >
                Xem Lịch Bác Sĩ
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                size="large"
                onClick={() => navigate('/staff/appointments?status=assigned')}
              >
                Đã Phân Công
              </Button>
              <Button
                icon={<RiseOutlined />}
                size="large"
                onClick={() => navigate('/staff/statistics')}
              >
                Thống Kê
              </Button>
            </Space>
          </Card>

          {/* Priority Quick Reference */}
          <Card
            style={{ marginBottom: 24 }}
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <span>Tham Chiếu Nhanh Mức Độ Ưu Tiên</span>
              </Space>
            }
            extra={
              <Button
                icon={<QuestionCircleOutlined />}
                type="link"
                onClick={() => setShowGuideModal(true)}
              >
                Xem chi tiết
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  size="small"
                  style={{
                    borderLeft: '4px solid #ff4d4f',
                    background: '#fff1f0',
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                      <Tag color="red">P1</Tag>
                      <Text strong>CỰC KHẨN</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      • Yêu cầu đổi lịch chờ duyệt
                      <br />• Chưa có bác sĩ (≤ 24h)
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  size="small"
                  style={{
                    borderLeft: '4px solid #ffa940',
                    background: '#fff7e6',
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                      <Tag color="orange">P2</Tag>
                      <Text strong>KHẨN</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Quá hạn xử lý
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  size="small"
                  style={{
                    borderLeft: '4px solid #faad14',
                    background: '#fffbe6',
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                      <Tag color="gold">P3</Tag>
                      <Text strong>CAO</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sắp đến giờ (trong 4h)
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  size="small"
                  style={{
                    borderLeft: '4px solid #1890ff',
                    background: '#e6f7ff',
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                      <Tag color="blue">KHÁC</Tag>
                      <Text strong>THẤP</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Lịch hẹn khác
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {/* Main Content - Different for CASHIER and DOCTOR */}
      <Row gutter={[16, 16]}>
        {isCashierRole ? (
          // CASHIER View - Urgent Appointments
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <Badge count={urgentAppointments.length} offset={[10, 0]}>
                    <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />
                  </Badge>
                  <span>Lịch Hẹn Cần Xử Lý Gấp</span>
                  {!loading && urgentAppointments.length > 0 && (
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>
                      {urgentAppointments.length} lịch
                    </Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  <Button
                    icon={<QuestionCircleOutlined />}
                    onClick={() => setShowGuideModal(true)}
                    type="dashed"
                  >
                    Hướng dẫn
                  </Button>
                  <Button
                    icon={<ThunderboltOutlined />}
                    onClick={fetchUrgentAppointments}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                  <Button type="primary" onClick={() => navigate('/staff/pending-appointments')}>
                    Xem Tất Cả
                  </Button>
                </Space>
              }
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
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" tip="Đang tải danh sách lịch hẹn cần xử lý..." />
                </div>
              ) : urgentAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircleOutlined
                    style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}
                  />
                  <Title level={4}>Tuyệt vời! Không có lịch hẹn cần xử lý gấp</Title>
                  <Text type="secondary">
                    Tất cả lịch hẹn đã được xử lý hoặc không có lịch cần ưu tiên
                  </Text>
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={urgentAppointments}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          onClick={() => handleAssignAppointment(item)}
                        >
                          Xử Lý
                        </Button>,
                      ]}
                      style={{
                        background: item.priorityLevel <= 2 ? '#fff7e6' : '#fff',
                        padding: '12px 16px',
                        marginBottom: 8,
                        borderRadius: 8,
                        border: `2px solid ${
                          item.priorityLevel === 1
                            ? '#ff4d4f'
                            : item.priorityLevel === 2
                              ? '#ffa940'
                              : '#f0f0f0'
                        }`,
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge
                            count={item.priorityLevel}
                            style={{
                              backgroundColor: getUrgencyColor(item.priorityLevel),
                            }}
                          >
                            <Avatar
                              size={48}
                              style={{
                                backgroundColor: getUrgencyColor(item.priorityLevel),
                              }}
                              icon={getUrgencyIcon(item.urgencyType)}
                            />
                          </Badge>
                        }
                        title={
                          <Space wrap>
                            <Text strong>#{item.id}</Text>
                            <Text strong style={{ color: '#1890ff' }}>
                              {item.patientName}
                            </Text>
                            <Tag
                              color={getUrgencyColor(item.priorityLevel)}
                              icon={getUrgencyIcon(item.urgencyType)}
                            >
                              {getPriorityText(item.priorityLevel)}
                            </Tag>
                            {item.urgencyType === 'RESCHEDULE_PENDING' && (
                              <Tag color="purple">ĐỔI LỊCH</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            {/* Patient Info */}
                            <Space wrap>
                              <PhoneOutlined />
                              <Text type="secondary">{item.patientPhone}</Text>
                              <Tag color="blue">
                                {item.vaccineName} - Mũi {item.doseNumber}
                              </Tag>
                            </Space>

                            {/* Urgency Message */}
                            <Alert
                              message={item.urgencyMessage}
                              type={
                                item.priorityLevel === 1
                                  ? 'error'
                                  : item.priorityLevel === 2
                                    ? 'warning'
                                    : 'info'
                              }
                              showIcon
                              icon={getUrgencyIcon(item.urgencyType)}
                              style={{ marginTop: 8 }}
                            />

                            {/* Schedule Info */}
                            <Space split="|" wrap style={{ marginTop: 8 }}>
                              <Tooltip title="Lịch hiện tại">
                                <Text style={{ fontSize: 12 }}>
                                  <CalendarOutlined /> Hẹn:{' '}
                                  {dayjs(item.scheduledDate).format('DD/MM/YYYY')}{' '}
                                  {item.scheduledTime}
                                </Text>
                              </Tooltip>

                              {item.desiredDate && (
                                <Tooltip title="Ngày mong muốn đổi">
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: '#ff4d4f',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Muốn đổi: {dayjs(item.desiredDate).format('DD/MM/YYYY')}{' '}
                                    {item.desiredTime}
                                  </Text>
                                </Tooltip>
                              )}

                              {item.doctorName ? (
                                <Text style={{ fontSize: 12 }}>
                                  <UserOutlined /> BS: {item.doctorName}
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
                                  <WarningOutlined /> Chưa có bác sĩ
                                </Text>
                              )}

                              <Tag
                                color={item.status === 'PENDING_APPROVAL' ? 'orange' : 'default'}
                              >
                                {item.status}
                              </Tag>
                            </Space>

                            {/* Reschedule Reason */}
                            {item.rescheduleReason && (
                              <Alert
                                message="Lý do đổi lịch"
                                description={item.rescheduleReason}
                                type="info"
                                showIcon
                                style={{ marginTop: 8 }}
                              />
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        ) : (
          // DOCTOR View - Today's appointments
          <Col xs={24} lg={24}>
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ fontSize: 20 }} />
                  Lịch hẹn hôm nay - {dayjs().format('DD/MM/YYYY')}
                </Space>
              }
              extra={
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={fetchTodayAppointments}
                  loading={loadingToday}
                >
                  Làm mới
                </Button>
              }
              bordered={false}
            >
              {loadingToday ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" tip="Đang tải lịch hẹn hôm nay..." />
                </div>
              ) : todayAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircleOutlined
                    style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}
                  />
                  <Title level={4}>Không có lịch hẹn hôm nay</Title>
                  <Text type="secondary">Bạn có thể nghỉ ngơi hoặc xem lịch hẹn khác</Text>
                </div>
              ) : (
                <List
                  dataSource={todayAppointments}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tag
                          color={
                            item.status === 'COMPLETED'
                              ? 'green'
                              : item.status === 'SCHEDULED'
                                ? 'blue'
                                : item.status === 'CANCELLED'
                                  ? 'red'
                                  : 'orange'
                          }
                          icon={
                            item.status === 'COMPLETED' ? (
                              <CheckCircleOutlined />
                            ) : item.status === 'SCHEDULED' ? (
                              <ClockCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )
                          }
                        >
                          {item.status === 'COMPLETED'
                            ? 'Đã hoàn thành'
                            : item.status === 'SCHEDULED'
                              ? 'Đã xếp lịch'
                              : item.status === 'CANCELLED'
                                ? 'Đã hủy'
                                : item.status}
                        </Tag>,
                        item.status === 'SCHEDULED' && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => navigate(`/staff/appointments/${item.id}`)}
                          >
                            Xem chi tiết
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} size={48} />}
                        title={
                          <Space>
                            <Text strong style={{ fontSize: 16 }}>
                              {item.patientName}
                            </Text>
                            <Tag color="blue">
                              {item.vaccineName} - Mũi {item.doseNumber}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Text>
                              <ClockCircleOutlined /> {item.scheduledTime} -{' '}
                              {dayjs(item.scheduledDate).format('DD/MM/YYYY')}
                            </Text>
                            <Text type="secondary">
                              <PhoneOutlined /> {item.patientPhone || 'N/A'}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Urgency Guide Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Hướng Dẫn Phân Loại Mức Độ Ưu Tiên</span>
          </Space>
        }
        open={showGuideModal}
        onCancel={() => setShowGuideModal(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <UrgencyGuide />
      </Modal>

      {/* Process Urgent Appointment Modal */}
      <ProcessUrgentAppointmentModal
        open={processModalOpen}
        onClose={() => {
          setProcessModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          fetchUrgentAppointments();
        }}
      />
    </div>
  );
};

export default StaffDashboard;
