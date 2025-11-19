/* eslint-disable react/jsx-key */
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  List,
  Typography,
  Tag,
  Space,
  Badge,
  Tooltip,
  Avatar,
} from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarFilled,
  RiseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.account.user);
  const isCashierRole = user?.role === 'CASHIER';
  const isDoctorRole = user?.role === 'DOCTOR';

  // Mock data for CASHIER - Pending appointments that need scheduling
  const pendingAppointments = [
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
  const upcomingAppointments = [
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

  const recentVaccinations = [
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

  const handleAssignAppointment = (appointmentId) => {
    // Navigate to assignment page or open modal
    navigate('/staff/appointments?assign=' + appointmentId);
  };

  const getVaccineColor = (type) => {
    const colors = {
      info: 'blue',
      primary: 'cyan',
      success: 'green',
      warning: 'orange',
      error: 'red',
    };
    return colors[type] || 'default';
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
            <Tag color={isCashierRole ? 'blue' : 'green'} style={{ fontSize: 16, padding: '4px 12px' }}>
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
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <span>Chờ Xếp Lịch</span>
                </Space>
              }
              value={12}
              suffix="lịch hẹn"
              valueStyle={{ color: '#faad14', fontSize: 28 }}
            />
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> Cần xử lý ngay
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
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
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
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
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
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <InfoCircleOutlined /> Xem chi tiết
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions - Only for CASHIER */}
      {isCashierRole && (
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
      )}

      {/* Main Content - Different for CASHIER and DOCTOR */}
      <Row gutter={[16, 16]}>
        {isCashierRole ? (
          // CASHIER View - Pending Appointments
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <Badge count={pendingAppointments.length} offset={[10, 0]}>
                    <ClockCircleOutlined style={{ fontSize: 20, color: '#faad14' }} />
                  </Badge>
                  <span>Lịch Hẹn Cần Xử Lý Gấp</span>
                </Space>
              }
              extra={
                <Button type="primary" onClick={() => navigate('/staff/appointments')}>
                  Xem Tất Cả
                </Button>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={pendingAppointments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => handleAssignAppointment(item.id)}
                      >
                        Phân Công
                      </Button>,
                    ]}
                    style={{
                      background: item.isUrgent ? '#fff7e6' : '#fff',
                      padding: '12px 16px',
                      marginBottom: 8,
                      borderRadius: 8,
                      border: item.isUrgent ? '1px solid #ffa940' : '1px solid #f0f0f0',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                          {item.id.substring(2)}
                        </Avatar>
                      }
                      title={
                        <Space>
                          <Text strong>#{item.id}</Text>
                          <Text strong style={{ color: '#1890ff' }}>{item.patientName}</Text>
                          {item.isUrgent && (
                            <Tag color="red" icon={<ClockCircleOutlined />}>
                              GẤP
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Space>
                            <PhoneOutlined />
                            <Text type="secondary">{item.phone}</Text>
                            <Tag color={getVaccineColor(item.vaccineType)}>{item.vaccine}</Tag>
                          </Space>
                          <Space split="|">
                            <Tooltip title="Ngày đăng ký">
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Đăng ký: {item.registeredDate}
                              </Text>
                            </Tooltip>
                            <Tooltip title="Ngày mong muốn">
                              <Text 
                                style={{ 
                                  fontSize: 12,
                                  color: item.isUrgent ? '#ff4d4f' : undefined,
                                  fontWeight: item.isUrgent ? 'bold' : 'normal'
                                }}
                              >
                                Mong muốn: {item.preferredDate}
                              </Text>
                            </Tooltip>
                            <Tag color="warning">Chờ Xếp</Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ) : (
          // DOCTOR View - Original layout
          <>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <Space>
                    <CalendarOutlined style={{ fontSize: 20 }} />
                    Lịch hẹn sắp tới
                  </Space>
                }
                bordered={false}
              >
                <List
                  dataSource={upcomingAppointments}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tag
                          color={item.status === 'confirmed' ? 'green' : 'orange'}
                          icon={item.status === 'confirmed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        >
                          {item.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </Tag>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} size={40} />}
                        title={`${item.patientName} - ${item.vaccine}`}
                        description={`${item.date} lúc ${item.time}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title={
                  <Space>
                    <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    Tiêm chủng gần đây
                  </Space>
                }
                bordered={false}
              >
                <List
                  dataSource={recentVaccinations}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                        title={`${item.patientName} - ${item.vaccine}`}
                        description={`${item.date}${isDoctorRole ? ` - Mũi ${item.dose}` : ''}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default StaffDashboard;
