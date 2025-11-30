import {
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  LeftOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  message,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useEffect, useState } from 'react';
import { getAppointmentStatusColor, getAppointmentStatusDisplay } from '@/constants/enums';
import { callFetchAppointmentOfCenter } from '../../services/appointment.service';
import { formatAppointmentTime } from '../../utils/appointment';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

const { Title, Text } = Typography;

const CalendarView = () => {
  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Mock doctors data - should be replaced with API call
  const doctors = [
    { id: 'all', name: 'Tất cả bác sĩ' },
    { id: 'BS001', name: 'BS. Nguyễn Văn Minh' },
    { id: 'BS002', name: 'BS. Trần Thị Hoa' },
    { id: 'BS003', name: 'BS. Lê Văn Hùng' },
    { id: 'BS004', name: 'BS. Phạm Thị Mai' },
  ];
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let filter = '';

      if (viewMode === 'month') {
        const startOfMonth = selectedDate.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = selectedDate.endOf('month').format('YYYY-MM-DD');
        filter = `scheduledDate >= '${startOfMonth}' AND scheduledDate <= '${endOfMonth}'`;
      } else if (viewMode === 'week') {
        const startOfWeek = selectedDate.startOf('isoWeek').format('YYYY-MM-DD');
        const endOfWeek = selectedDate.endOf('isoWeek').format('YYYY-MM-DD');
        filter = `scheduledDate >= '${startOfWeek}' AND scheduledDate <= '${endOfWeek}'`;
      } else if (viewMode === 'day') {
        filter = `scheduledDate ~ '${selectedDate.format('YYYY-MM-DD')}'`;
      }

      if (selectedDoctor !== 'all') {
        filter += ` AND doctorId = '${selectedDoctor}'`;
      }

      const response = await callFetchAppointmentOfCenter(`filter=${filter}`);
      setAppointments(response.data.result || []);
    } catch {
      message.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments based on view mode
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'day') {
      setSelectedDate(selectedDate.subtract(1, 'day'));
    } else if (viewMode === 'week') {
      setSelectedDate(selectedDate.subtract(1, 'week'));
    } else {
      setSelectedDate(selectedDate.subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setSelectedDate(selectedDate.add(1, 'day'));
    } else if (viewMode === 'week') {
      setSelectedDate(selectedDate.add(1, 'week'));
    } else {
      setSelectedDate(selectedDate.add(1, 'month'));
    }
  };

  const handleToday = () => {
    setSelectedDate(dayjs());
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  // Get vaccine color
  const getVaccineColor = (vaccineName) => {
    if (!vaccineName) return 'blue';
    const name = vaccineName.toLowerCase();
    if (name.includes('covid')) return 'red';
    if (name.includes('cúm') || name.includes('flu')) return 'green';
    if (name.includes('viêm gan a')) return 'orange';
    if (name.includes('viêm gan b')) return 'blue';
    return 'purple';
  };

  // Render Week View
  const renderWeekView = () => {
    const weekStart = selectedDate.startOf('isoWeek');
    const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'];

    // Group appointments by date and time
    const appointmentsByDateTime = {};
    appointments.forEach((apt) => {
      const date = dayjs(apt.scheduledDate).format('YYYY-MM-DD');
      const time = formatAppointmentTime(apt).substring(0, 5);
      const key = `${date}-${time}`;
      if (!appointmentsByDateTime[key]) {
        appointmentsByDateTime[key] = [];
      }
      appointmentsByDateTime[key].push(apt);
    });

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(7, 1fr)',
          gap: '1px',
          background: '#e0e0e0',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            background: '#f5f5f5',
            padding: '15px 8px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Giờ
        </div>
        {weekDays.map((day) => {
          const isToday = day.isSame(dayjs(), 'day');
          return (
            <div
              key={day.format('YYYY-MM-DD')}
              style={{
                background: isToday ? '#e7f3ff' : '#f5f5f5',
                padding: '15px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{day.format('dd')}</div>
              <Text type={isToday ? 'primary' : 'secondary'} style={{ fontSize: '12px' }}>
                {day.format('DD/MM')}
              </Text>
            </div>
          );
        })}

        {/* Time Slots */}
        {timeSlots.map((time) => (
          <>
            <div
              key={`time-${time}`}
              style={{
                background: '#f5f5f5',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
                minHeight: '100px',
              }}
            >
              {time}
            </div>
            {weekDays.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const key = `${dateStr}-${time}`;
              const dayAppointments = appointmentsByDateTime[key] || [];

              return (
                <div
                  key={key}
                  style={{
                    background: 'white',
                    padding: '8px',
                    minHeight: '100px',
                    position: 'relative',
                  }}
                >
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.appointmentId}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAppointmentClick(apt)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAppointmentClick(apt)}
                      style={{
                        background: getVaccineColor(apt.vaccine?.name),
                        color: 'white',
                        padding: '6px',
                        marginBottom: '4px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderLeft: '3px solid rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(2px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <strong>{formatAppointmentTime(apt).substring(0, 5)}</strong>
                      <br />
                      {apt.user?.firstName} {apt.user?.lastName}
                      <br />
                      <small>{apt.vaccine?.name}</small>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    return (
      <div style={{ background: 'white' }}>
        {appointments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Text type="secondary">Không có lịch hẹn nào trong ngày này</Text>
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.appointmentId}
              role="button"
              tabIndex={0}
              onClick={() => handleAppointmentClick(apt)}
              onKeyDown={(e) => e.key === 'Enter' && handleAppointmentClick(apt)}
              style={{
                border: '1px solid #f0f0f0',
                padding: '15px',
                marginBottom: '2px',
                background: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <Row align="middle" gutter={16}>
                <Col span={4}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>{formatAppointmentTime(apt).substring(0, 5)}</Text>
                  </Space>
                </Col>
                <Col span={20}>
                  <Space size="middle" split="|">
                    <Tag color={getVaccineColor(apt.vaccine?.name)}>{apt.vaccine?.name}</Tag>
                    <Space>
                      <UserOutlined />
                      <Text strong>
                        {apt.user?.firstName} {apt.user?.lastName}
                      </Text>
                    </Space>
                    <Text>
                      BS. {apt.doctor?.firstName} {apt.doctor?.lastName}
                    </Text>
                    <Space>
                      <PhoneOutlined />
                      <Text type="secondary">{apt.user?.phone}</Text>
                    </Space>
                  </Space>
                </Col>
              </Row>
            </div>
          ))
        )}
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const monthStart = selectedDate.startOf('month');
    const monthEnd = selectedDate.endOf('month');
    const startDate = monthStart.startOf('isoWeek');
    const endDate = monthEnd.endOf('isoWeek');

    const weeks = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(currentDate);
        currentDate = currentDate.add(1, 'day');
      }
      weeks.push(week);
    }

    // Group appointments by date
    const appointmentsByDate = {};
    appointments.forEach((apt) => {
      const date = dayjs(apt.scheduledDate).format('YYYY-MM-DD');
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      appointmentsByDate[date].push(apt);
    });

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: '#e0e0e0',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Header */}
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
          <div
            key={day}
            style={{
              background: '#f5f5f5',
              padding: '15px 8px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {weeks.map((week) =>
          week.map((day) => {
            const isCurrentMonth = day.month() === selectedDate.month();
            const isToday = day.isSame(dayjs(), 'day');
            const dateStr = day.format('YYYY-MM-DD');
            const dayAppointments = appointmentsByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                role="button"
                tabIndex={0}
                style={{
                  background: isCurrentMonth ? 'white' : '#f9f9f9',
                  minHeight: '120px',
                  padding: '8px',
                  position: 'relative',
                  border: isToday ? '2px solid #1890ff' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedDate(day);
                    setViewMode('day');
                  }
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: isToday ? '#1890ff' : isCurrentMonth ? '#000' : '#999',
                  }}
                >
                  {day.format('D')}
                </div>
                <div>
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.appointmentId}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: getVaccineColor(apt.vaccine?.name),
                        display: 'inline-block',
                        marginRight: '2px',
                        marginBottom: '2px',
                      }}
                    />
                  ))}
                </div>
                {dayAppointments.length > 0 && (
                  <Text
                    type="primary"
                    style={{
                      fontSize: '11px',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    <strong>{dayAppointments.length} lịch</strong>
                  </Text>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Get current period text
  const getCurrentPeriodText = () => {
    if (viewMode === 'day') {
      return `${selectedDate.format('dddd, DD MMMM, YYYY')}`;
    } else if (viewMode === 'week') {
      const weekStart = selectedDate.startOf('isoWeek');
      const weekEnd = selectedDate.endOf('isoWeek');
      return `Tuần ${selectedDate.isoWeek()} - ${weekStart.format(
        'DD/MM'
      )} đến ${weekEnd.format('DD/MM/YYYY')}`;
    } else {
      return `Tháng ${selectedDate.format('MM, YYYY')}`;
    }
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
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <CalendarOutlined /> Lịch Tiêm Chủng
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Xem lịch theo ngày, tuần, tháng</Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {dayjs().format('DD MMMM, YYYY')}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{dayjs().format('dddd')}</Text>
          </Col>
        </Row>
      </Card>

      {/* View Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8}>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Ngày', value: 'day', icon: <CalendarOutlined /> },
                { label: 'Tuần', value: 'week', icon: <CalendarOutlined /> },
                { label: 'Tháng', value: 'month', icon: <CalendarOutlined /> },
              ]}
              block
            />
          </Col>
          <Col xs={24} sm={24} md={10} style={{ textAlign: 'center' }}>
            <Space>
              <Button icon={<LeftOutlined />} onClick={handlePrevious} size="small" />
              <Button type="primary" onClick={handleToday} size="small">
                Hôm nay
              </Button>
              <Button icon={<RightOutlined />} onClick={handleNext} size="small" />
            </Space>
          </Col>
          <Col xs={24} sm={24} md={6} style={{ textAlign: 'right' }}>
            <Select
              value={selectedDoctor}
              onChange={setSelectedDoctor}
              style={{ width: '100%' }}
              size="small"
            >
              {doctors.map((doc) => (
                <Select.Option key={doc.id} value={doc.id}>
                  {doc.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Legend */}
      <Card style={{ marginBottom: '24px' }} bodyStyle={{ padding: '12px 24px' }}>
        <Space wrap>
          <Space>
            <Badge color="blue" />
            <Text>Viêm Gan B</Text>
          </Space>
          <Space>
            <Badge color="red" />
            <Text>COVID-19</Text>
          </Space>
          <Space>
            <Badge color="green" />
            <Text>Cúm</Text>
          </Space>
          <Space>
            <Badge color="orange" />
            <Text>Viêm Gan A</Text>
          </Space>
          <Space>
            <Badge color="gray" />
            <Text>Đã hoàn thành</Text>
          </Space>
        </Space>
      </Card>

      {/* Current Period Display */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <Text strong>{getCurrentPeriodText()}</Text>
          </Space>
        }
        loading={loading}
        style={{ marginBottom: '24px' }}
        bodyStyle={{ padding: 0 }}
      >
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'month' && renderMonthView()}
      </Card>

      {/* Appointment Detail Modal */}
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
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info('Chức năng chỉnh sửa đang phát triển')}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã lịch hẹn">
              <Text strong>#{selectedAppointment.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              <Space>
                <UserOutlined />
                <Text>
                  {selectedAppointment.user?.firstName} {selectedAppointment.user?.lastName}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                <Text>{selectedAppointment.user?.phone}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Loại vắc-xin">
              <Tag color={getVaccineColor(selectedAppointment.vaccine?.name)}>
                {selectedAppointment.vaccine?.name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              <Space>
                <ClockCircleOutlined />
                <Text>
                  {dayjs(selectedAppointment.scheduledDate).format('DD/MM/YYYY')} -{' '}
                  {formatAppointmentTime(selectedAppointment)}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              <Space>
                <MedicineBoxOutlined />
                <Text>
                  BS. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getAppointmentStatusColor(selectedAppointment.status)}>
                {getAppointmentStatusDisplay(selectedAppointment.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              <Text>{selectedAppointment.notes || 'Không có'}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;
