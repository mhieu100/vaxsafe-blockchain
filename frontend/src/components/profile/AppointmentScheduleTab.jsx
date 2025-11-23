import { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Tag,
  Timeline,
  Spin,
  Empty,
  Alert,
  Button,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { getMyBookings } from '../../services/booking.service';
import dayjs from 'dayjs';
import RescheduleAppointmentModal from '../modal/RescheduleAppointmentModal';

const { Title, Text } = Typography;

const AppointmentScheduleTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      if (response?.data) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'green';
      case 'COMPLETED':
        return 'blue';
      case 'SCHEDULED':
        return 'cyan';
      case 'PENDING':
        return 'orange';
      case 'PENDING_APPROVAL':
        return 'gold';
      case 'PROGRESS':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PENDING_APPROVAL':
        return 'Chờ duyệt đổi lịch';
      case 'PROGRESS':
        return 'Đang tiến hành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    fetchBookings(); // Reload data after successful reschedule
  };

  const allAppointments = bookings
    .flatMap((booking) =>
      booking.appointments.map((apt) => ({
        ...apt,
        bookingId: booking.bookingId,
        vaccineName: booking.vaccineName,
        patientName: booking.familyMemberName || booking.patientName,
        bookingStatus: booking.bookingStatus,
        isFamily: !!booking.familyMemberId,
        totalDoses: booking.totalDoses,
      }))
    )
    .sort(
      (a, b) =>
        dayjs(a.scheduledDate).valueOf() - dayjs(b.scheduledDate).valueOf()
    );

  const upcomingAppointments = allAppointments.filter(
    (apt) =>
      apt.appointmentStatus !== 'COMPLETED' &&
      apt.appointmentStatus !== 'CANCELLED' &&
      dayjs(apt.scheduledDate).isAfter(dayjs().subtract(1, 'day'))
  );

  const groupedByBooking = upcomingAppointments.reduce((acc, apt) => {
    if (!acc[apt.bookingId]) {
      acc[apt.bookingId] = [];
    }
    acc[apt.bookingId].push(apt);
    return acc;
  }, {});

  const selfBookings = Object.values(groupedByBooking).filter(
    (appointments) => appointments.length > 0 && !appointments[0].isFamily
  );
  const familyBookings = Object.values(groupedByBooking).filter(
    (appointments) => appointments.length > 0 && appointments[0].isFamily
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" tip="Đang tải lịch hẹn..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Lỗi tải dữ liệu" description={error} showIcon />
    );
  }

  if (upcomingAppointments.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có lịch hẹn tiêm chủng nào"
      />
    );
  }

  const renderVaccineTimeline = (appointments) => {
    if (appointments.length === 0) return null;

    const firstApt = appointments[0];
    return (
      <Card className="!mb-4" key={firstApt.bookingId}>
        <div className="mb-3 flex justify-between items-start">
          <div>
            <Title level={5} className="mb-1">
              {firstApt.vaccineName}
            </Title>
            <Text type="secondary">
              👤 {firstApt.patientName} • {firstApt.totalDoses} mũi tiêm
            </Text>
          </div>
          <Tag color={getStatusColor(firstApt.bookingStatus)}>
            Booking: {getStatusText(firstApt.bookingStatus)}
          </Tag>
        </div>

        <Timeline
          items={appointments.map((apt) => ({
            dot:
              apt.appointmentStatus === 'CONFIRMED' ? (
                <CheckCircleOutlined className="text-green-500" />
              ) : (
                <ClockCircleOutlined className="text-orange-500" />
              ),
            children: (
              <div className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Text strong>Mũi {apt.doseNumber}</Text>
                      <Tag
                        color={getStatusColor(apt.appointmentStatus)}
                        className="!m-0"
                      >
                        {getStatusText(apt.appointmentStatus)}
                      </Tag>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <Text type="secondary">
                          📅 {dayjs(apt.scheduledDate).format('DD/MM/YYYY')} lúc{' '}
                          {apt.scheduledTime}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">📍 {apt.centerName}</Text>
                      </div>
                      {apt.doctorName && (
                        <div>
                          <Text type="secondary">👨‍⚕️ BS: {apt.doctorName}</Text>
                        </div>
                      )}
                      {apt.appointmentStatus === 'PENDING_APPROVAL' && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <Text type="warning" className="text-xs">
                            ⏳ Đã gửi yêu cầu đổi lịch. Vui lòng chờ nhân viên cơ sở
                            liên hệ xác nhận.
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reschedule button */}
                  {apt.appointmentStatus !== 'COMPLETED' &&
                    apt.appointmentStatus !== 'CANCELLED' &&
                    apt.appointmentStatus !== 'PENDING_APPROVAL' &&
                    dayjs(apt.scheduledDate).isAfter(dayjs()) && (
                      <Button
                        type="link"
                        size="small"
                        icon={<CalendarOutlined />}
                        onClick={() => handleReschedule(apt)}
                        className="ml-2"
                      >
                        Đổi lịch
                      </Button>
                    )}
                </div>
              </div>
            ),
          }))}
        />
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4}>Lịch hẹn tiêm chủng sắp tới</Title>
        <Text type="secondary">
          Tổng cộng {upcomingAppointments.length} lịch hẹn từ{' '}
          {selfBookings.length + familyBookings.length} vaccine
        </Text>
      </div>

      {selfBookings.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Title level={5} className="!mb-0">
              Lịch tiêm của bạn
            </Title>
            <Tag color="blue">{selfBookings.length} vaccine</Tag>
          </div>
          {selfBookings.map((appointments) =>
            renderVaccineTimeline(appointments)
          )}
        </div>
      )}

      {familyBookings.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Title level={5} className="!mb-0">
              Lịch tiêm cho thành viên gia đình
            </Title>
            <Tag color="purple">{familyBookings.length} vaccine</Tag>
          </div>
          {familyBookings.map((appointments) =>
            renderVaccineTimeline(appointments)
          )}
        </div>
      )}

      <Card className="mt-4 bg-blue-50">
        <Title level={5}>📋 Hướng dẫn trước khi tiêm</Title>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Vui lòng đến trước 15 phút so với giờ hẹn</li>
          <li>• Mang theo CCCD/CMND và thẻ bảo hiểm y tế</li>
          <li>• Mặc quần áo thoải mái, dễ tiêm</li>
          <li>
            • Thông báo cho nhân viên y tế nếu có dị ứng hoặc đang dùng thuốc
          </li>
          <li>• Ăn uống đầy đủ trước khi tiêm</li>
        </ul>
      </Card>

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <RescheduleAppointmentModal
          open={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          appointment={selectedAppointment}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
};

export default AppointmentScheduleTab;
