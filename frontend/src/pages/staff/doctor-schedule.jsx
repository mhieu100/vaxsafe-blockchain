import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  List,
  Modal,
  message,
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
import { getDoctorsWithScheduleAPI } from '../../services/doctor.service';

const { Title, Text } = Typography;

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('today');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchDoctorsWithSchedule = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await getDoctorsWithScheduleAPI(dateStr);

      // Transform API response to match component structure
      const transformedDoctors = response.data.map((doctor) => ({
        id: `BS${String(doctor.doctorId).padStart(3, '0')}`,
        doctorId: doctor.doctorId,
        name: doctor.doctorName,
        specialty: doctor.specialization || 'Đa khoa',
        phone: doctor.phone || doctor.email,
        workingHours: doctor.workingHoursToday || '08:00 - 17:00',
        color: getColorForDoctor(doctor.doctorId),
        availableSlots: doctor.availableSlotsToday || 0,
        bookedSlots: doctor.bookedSlotsToday || 0,
        schedule: (doctor.todaySchedule || []).map((slot) => ({
          slotId: slot.slotId,
          time: `${slot.startTime} - ${slot.endTime}`,
          status: slot.status === 'AVAILABLE' ? 'available' : 'booked',
          patient: slot.appointmentId ? 'Bệnh nhân' : null,
          vaccine: slot.notes || '',
        })),
      }));

      setDoctors(transformedDoctors);
    } catch (_error) {
      message.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };
  // Fetch doctors with schedule when component mounts or date changes
  useEffect(() => {
    fetchDoctorsWithSchedule();
  }, []);

  // Get color for doctor based on ID
  const getColorForDoctor = (doctorId) => {
    const colors = ['blue', 'green', 'cyan', 'orange', 'purple', 'magenta'];
    return colors[doctorId % colors.length];
  };

  // Calculate summary statistics
  const summary = {
    totalDoctors: doctors.length,
    totalAvailableSlots: doctors.reduce((sum, doc) => sum + doc.availableSlots, 0),
    totalBookedSlots: doctors.reduce((sum, doc) => sum + doc.bookedSlots, 0),
  };
  summary.availabilityRate = Math.round(
    (summary.totalAvailableSlots / (summary.totalAvailableSlots + summary.totalBookedSlots)) * 100
  );

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'today') {
      setSelectedDate(dayjs());
    } else if (mode === 'tomorrow') {
      setSelectedDate(dayjs().add(1, 'day'));
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setViewMode('custom');
  };

  // Handle slot click
  const handleSlotClick = (doctor, slot) => {
    if (slot.status === 'available') {
      setSelectedDoctor(doctor);
      setSelectedSlot(slot);
      setDetailModalOpen(true);
    }
  };

  // Handle view doctor detail
  const handleViewDoctorDetail = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setDetailModalOpen(true);
  };

  // Render time slot
  const renderTimeSlot = (doctor, slot, index) => {
    const isAvailable = slot.status === 'available';

    return (
      <div
        key={index}
        onClick={() => handleSlotClick(doctor, slot)}
        style={{
          border: '1px solid #d9d9d9',
          padding: '10px',
          marginBottom: '5px',
          borderRadius: '6px',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          background: isAvailable ? '#f6ffed' : '#fff2f0',
          borderColor: isAvailable ? '#b7eb8f' : '#ffccc7',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (isAvailable) {
            e.currentTarget.style.borderColor = '#52c41a';
            e.currentTarget.style.background = '#d9f7be';
          }
        }}
        onMouseLeave={(e) => {
          if (isAvailable) {
            e.currentTarget.style.borderColor = '#b7eb8f';
            e.currentTarget.style.background = '#f6ffed';
          }
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ClockCircleOutlined />
              <Text>{slot.time}</Text>
            </Space>
          </Col>
          <Col>
            <Badge
              status={isAvailable ? 'success' : 'error'}
              text={isAvailable ? 'Trống' : 'Đã đặt'}
            />
          </Col>
        </Row>
        {!isAvailable && slot.patient && (
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
            <Text type="secondary">
              {slot.patient} - {slot.vaccine}
            </Text>
          </div>
        )}
      </div>
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
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <CalendarOutlined /> Lịch Bác Sĩ
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Quản lý lịch làm việc của bác sĩ</Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {dayjs().format('DD MMMM, YYYY')}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{dayjs().format('dddd')}</Text>
          </Col>
        </Row>
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Đang tải danh sách bác sĩ...</Text>
          </div>
        </div>
      )}

      {/* Main content - only show when not loading */}
      {!loading && (
        <>
          {/* Controls */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={16}>
                <Space wrap>
                  <Segmented
                    value={viewMode}
                    onChange={handleViewModeChange}
                    options={[
                      { label: 'Hôm nay', value: 'today' },
                      { label: 'Ngày mai', value: 'tomorrow' },
                      { label: 'Tuần này', value: 'week' },
                    ]}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Current Date Display */}
          <Card
            style={{
              marginBottom: '24px',
              background: '#e6f7ff',
              borderColor: '#91d5ff',
            }}
            bodyStyle={{ padding: '12px 24px' }}
          >
            <Space>
              <CalendarOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Text strong style={{ color: '#1890ff' }}>
                Đang xem lịch ngày: {selectedDate.format('DD/MM/YYYY')} (
                {selectedDate.format('dddd')})
              </Text>
            </Space>
          </Card>

          {/* Doctors Grid */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {doctors.length === 0 ? (
              <Col span={24}>
                <Card style={{ textAlign: 'center', padding: '50px' }}>
                  <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                  <Title level={4} type="secondary">
                    Không có bác sĩ nào
                  </Title>
                  <Text type="secondary">
                    Không tìm thấy bác sĩ nào làm việc tại trung tâm của bạn vào ngày này
                  </Text>
                </Card>
              </Col>
            ) : (
              doctors.map((doctor) => (
                <Col key={doctor.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    styles={{
                      header: {
                        background:
                          doctor.color === 'blue'
                            ? '#1890ff'
                            : doctor.color === 'green'
                              ? '#52c41a'
                              : doctor.color === 'cyan'
                                ? '#13c2c2'
                                : doctor.color === 'orange'
                                  ? '#fa8c16'
                                  : '#1890ff',
                        color: 'white',
                      },
                    }}
                    title={
                      <Space>
                        <Avatar
                          size={40}
                          icon={<UserOutlined />}
                          style={{ background: 'rgba(255,255,255,0.3)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>BS. {doctor.name}</div>
                          <small>Chuyên khoa: {doctor.specialty}</small>
                        </div>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            Ca làm việc: {doctor.workingHours}
                          </Text>
                        </Space>
                        <Space>
                          <PhoneOutlined />
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            SĐT: {doctor.phone}
                          </Text>
                        </Space>
                      </Space>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <Text strong>Trạng thái hôm nay:</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space>
                          <Badge
                            count={`${doctor.availableSlots} trống`}
                            style={{ backgroundColor: '#52c41a' }}
                          />
                          <Badge
                            count={`${doctor.bookedSlots} đã đặt`}
                            style={{ backgroundColor: '#f5222d' }}
                          />
                        </Space>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '16px',
                        marginBottom: '16px',
                      }}
                    >
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        Lịch khả dụng:
                      </Text>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {doctor.schedule.map((slot, index) => renderTimeSlot(doctor, slot, index))}
                      </div>
                    </div>

                    <Button
                      type="primary"
                      ghost
                      icon={<EyeOutlined />}
                      block
                      onClick={() => handleViewDoctorDetail(doctor)}
                    >
                      Xem chi tiết lịch
                    </Button>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {/* Summary Statistics */}
          <Card
            title={
              <Space>
                <MedicineBoxOutlined />
                <Text strong>Tổng Quan Lịch Hôm Nay</Text>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tổng bác sĩ"
                  value={summary.totalDoctors}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Slot trống"
                  value={summary.totalAvailableSlots}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Slot đã đặt"
                  value={summary.totalBookedSlots}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tỷ lệ trống"
                  value={summary.availabilityRate}
                  valueStyle={{ color: '#13c2c2' }}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          selectedSlot ? (
            <Space>
              <ClockCircleOutlined />
              <Text strong>Thông Tin Slot Thời Gian</Text>
            </Space>
          ) : (
            <Space>
              <UserOutlined />
              <Text strong>Chi Tiết Lịch Bác Sĩ</Text>
            </Space>
          )
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          selectedSlot && (
            <Button
              key="assign"
              type="primary"
              onClick={() => {
                message.success('Chức năng phân công lịch hẹn đang phát triển');
                setDetailModalOpen(false);
              }}
            >
              Phân công lịch hẹn
            </Button>
          ),
        ]}
        width={700}
      >
        {selectedDoctor && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Bác sĩ" span={2}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <Text strong>BS. {selectedDoctor.name}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên khoa">{selectedDoctor.specialty}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Space>
                  <PhoneOutlined />
                  {selectedDoctor.phone}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ca làm việc" span={2}>
                <Space>
                  <ClockCircleOutlined />
                  {selectedDoctor.workingHours}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {selectedSlot ? (
              <Card title="Thông tin slot được chọn" style={{ background: '#f6ffed' }}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Thời gian">
                    <Tag color="blue" icon={<ClockCircleOutlined />}>
                      {selectedSlot.time}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={selectedSlot.status === 'available' ? 'success' : 'error'}
                      text={
                        selectedSlot.status === 'available'
                          ? 'Slot trống - Có thể phân công'
                          : 'Đã có lịch hẹn'
                      }
                    />
                  </Descriptions.Item>
                </Descriptions>
                {selectedSlot.status === 'available' && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '6px',
                    }}
                  >
                    <Text type="secondary">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      Bạn có thể phân công lịch hẹn cho slot thời gian này
                    </Text>
                  </div>
                )}
              </Card>
            ) : (
              <Card title="Lịch làm việc chi tiết" style={{ marginTop: '16px' }}>
                <List
                  size="small"
                  dataSource={selectedDoctor.schedule}
                  renderItem={(slot) => (
                    <List.Item>
                      <Row style={{ width: '100%' }} justify="space-between" align="middle">
                        <Col>
                          <Space>
                            <ClockCircleOutlined />
                            <Text>{slot.time}</Text>
                          </Space>
                        </Col>
                        <Col>
                          {slot.status === 'available' ? (
                            <Tag color="success">Trống</Tag>
                          ) : (
                            <Space>
                              <Tag color="error">Đã đặt</Tag>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {slot.patient} - {slot.vaccine}
                              </Text>
                            </Space>
                          )}
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default DoctorSchedule;
