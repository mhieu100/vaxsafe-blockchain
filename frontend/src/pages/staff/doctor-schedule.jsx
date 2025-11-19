import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Typography, 
  Badge, 
  DatePicker, 
  Segmented,
  Statistic,
  Modal,
  Descriptions,
  List,
  Avatar,
  Tag,
  message
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('today');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Mock doctors data - should be replaced with API call
  const [doctors] = useState([
    {
      id: 'BS001',
      name: 'Nguyễn Văn Minh',
      specialty: 'Nhi',
      phone: '0912345678',
      workingHours: '08:00 - 17:00',
      color: 'blue',
      availableSlots: 7,
      bookedSlots: 5,
      schedule: [
        { time: '08:00 - 08:30', status: 'available' },
        { time: '08:30 - 09:00', status: 'booked', patient: 'Nguyễn Văn A', vaccine: 'COVID-19' },
        { time: '09:00 - 09:30', status: 'available' },
        { time: '09:30 - 10:00', status: 'booked', patient: 'Trần Thị B', vaccine: 'Cúm' },
        { time: '10:00 - 10:30', status: 'available' },
        { time: '10:30 - 11:00', status: 'available' },
        { time: '11:00 - 11:30', status: 'booked', patient: 'Lê Văn C', vaccine: 'Viêm Gan B' },
        { time: '13:00 - 13:30', status: 'available' },
        { time: '13:30 - 14:00', status: 'booked', patient: 'Phạm Thị D', vaccine: 'COVID-19' },
        { time: '14:00 - 14:30', status: 'available' },
        { time: '14:30 - 15:00', status: 'booked', patient: 'Võ Văn E', vaccine: 'Viêm Gan A' },
        { time: '15:00 - 15:30', status: 'available' },
      ]
    },
    {
      id: 'BS002',
      name: 'Trần Thị Lan',
      specialty: 'Đa khoa',
      phone: '0923456789',
      workingHours: '08:00 - 17:00',
      color: 'green',
      availableSlots: 10,
      bookedSlots: 2,
      schedule: [
        { time: '08:00 - 08:30', status: 'available' },
        { time: '08:30 - 09:00', status: 'available' },
        { time: '09:00 - 09:30', status: 'available' },
        { time: '09:30 - 10:00', status: 'booked', patient: 'Đinh Thị F', vaccine: 'Cúm' },
        { time: '10:00 - 10:30', status: 'available' },
        { time: '10:30 - 11:00', status: 'available' },
        { time: '11:00 - 11:30', status: 'booked', patient: 'Hoàng Văn G', vaccine: 'COVID-19' },
        { time: '13:00 - 13:30', status: 'available' },
        { time: '13:30 - 14:00', status: 'available' },
        { time: '14:00 - 14:30', status: 'available' },
        { time: '14:30 - 15:00', status: 'available' },
        { time: '15:00 - 15:30', status: 'available' },
      ]
    },
    {
      id: 'BS003',
      name: 'Lê Hoàng Nam',
      specialty: 'Truyền nhiễm',
      phone: '0934567890',
      workingHours: '13:00 - 21:00',
      color: 'cyan',
      availableSlots: 12,
      bookedSlots: 4,
      schedule: [
        { time: '13:00 - 13:30', status: 'available' },
        { time: '13:30 - 14:00', status: 'available' },
        { time: '14:00 - 14:30', status: 'booked', patient: 'Ngô Thị H', vaccine: 'Viêm Gan B' },
        { time: '14:30 - 15:00', status: 'available' },
        { time: '15:00 - 15:30', status: 'booked', patient: 'Phan Văn I', vaccine: 'COVID-19' },
        { time: '15:30 - 16:00', status: 'available' },
        { time: '16:00 - 16:30', status: 'available' },
        { time: '16:30 - 17:00', status: 'booked', patient: 'Dương Thị K', vaccine: 'Cúm' },
        { time: '17:00 - 17:30', status: 'available' },
        { time: '17:30 - 18:00', status: 'available' },
        { time: '18:00 - 18:30', status: 'booked', patient: 'Mai Văn L', vaccine: 'Viêm Gan A' },
        { time: '18:30 - 19:00', status: 'available' },
        { time: '19:00 - 19:30', status: 'available' },
        { time: '19:30 - 20:00', status: 'available' },
        { time: '20:00 - 20:30', status: 'available' },
        { time: '20:30 - 21:00', status: 'available' },
      ]
    },
    {
      id: 'BS004',
      name: 'Phạm Thị Hà',
      specialty: 'Sản Phụ khoa',
      phone: '0945678901',
      workingHours: '08:00 - 12:00',
      color: 'orange',
      availableSlots: 3,
      bookedSlots: 5,
      schedule: [
        { time: '08:00 - 08:30', status: 'booked', patient: 'Cao Thị M', vaccine: 'COVID-19' },
        { time: '08:30 - 09:00', status: 'booked', patient: 'Tạ Văn N', vaccine: 'Cúm' },
        { time: '09:00 - 09:30', status: 'available' },
        { time: '09:30 - 10:00', status: 'booked', patient: 'Đỗ Thị O', vaccine: 'Viêm Gan B' },
        { time: '10:00 - 10:30', status: 'available' },
        { time: '10:30 - 11:00', status: 'booked', patient: 'Hồ Văn P', vaccine: 'COVID-19' },
        { time: '11:00 - 11:30', status: 'available' },
        { time: '11:30 - 12:00', status: 'booked', patient: 'Lý Thị Q', vaccine: 'Viêm Gan A' },
      ]
    },
  ]);

  // Calculate summary statistics
  const summary = {
    totalDoctors: doctors.length,
    totalAvailableSlots: doctors.reduce((sum, doc) => sum + doc.availableSlots, 0),
    totalBookedSlots: doctors.reduce((sum, doc) => sum + doc.bookedSlots, 0),
  };
  summary.availabilityRate = Math.round((summary.totalAvailableSlots / (summary.totalAvailableSlots + summary.totalBookedSlots)) * 100);

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'today') {
      setSelectedDate(dayjs());
    } else if (mode === 'tomorrow') {
      setSelectedDate(dayjs().add(1, 'day'));
    }
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
            <Text type="secondary">{slot.patient} - {slot.vaccine}</Text>
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
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '30px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <CalendarOutlined /> Lịch Bác Sĩ
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Quản lý lịch làm việc của bác sĩ
            </Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {dayjs().format('DD MMMM, YYYY')}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              {dayjs().format('dddd')}
            </Text>
          </Col>
        </Row>
      </Card>

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
              onChange={(date) => {
                setSelectedDate(date);
                setViewMode('custom');
              }}
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
          borderColor: '#91d5ff'
        }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <Space>
          <CalendarOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
          <Text strong style={{ color: '#1890ff' }}>
            Đang xem lịch ngày: {selectedDate.format('DD/MM/YYYY')} ({selectedDate.format('dddd')})
          </Text>
        </Space>
      </Card>

      {/* Doctors Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {doctors.map((doctor) => (
          <Col key={doctor.id} xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ height: '100%' }}
              styles={{
                header: { 
                  background: doctor.color === 'blue' ? '#1890ff' :
                             doctor.color === 'green' ? '#52c41a' :
                             doctor.color === 'cyan' ? '#13c2c2' :
                             doctor.color === 'orange' ? '#fa8c16' : '#1890ff',
                  color: 'white'
                }
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

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '16px' }}>
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
        ))}
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
              <Descriptions.Item label="Chuyên khoa">
                {selectedDoctor.specialty}
              </Descriptions.Item>
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
              <Card 
                title="Thông tin slot được chọn"
                style={{ background: '#f6ffed' }}
              >
                <Descriptions column={1}>
                  <Descriptions.Item label="Thời gian">
                    <Tag color="blue" icon={<ClockCircleOutlined />}>
                      {selectedSlot.time}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Badge 
                      status={selectedSlot.status === 'available' ? 'success' : 'error'} 
                      text={selectedSlot.status === 'available' ? 'Slot trống - Có thể phân công' : 'Đã có lịch hẹn'} 
                    />
                  </Descriptions.Item>
                </Descriptions>
                {selectedSlot.status === 'available' && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
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
