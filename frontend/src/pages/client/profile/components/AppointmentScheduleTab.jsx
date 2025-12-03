import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Empty,
  Modal,
  message,
  Skeleton,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { RescheduleAppointmentModal } from '@/components/modal/appointment';
import { callCancelAppointment } from '@/services/appointment.service';
import { getMyBookings } from '@/services/booking.service';
import { formatAppointmentTime } from '@/utils/appointment';

const { Title, Text } = Typography;

const AppointmentScheduleTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      if (response?.data) {
        setBookings(response.data);
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
      case 'RESCHEDULE':
        return 'gold';
      case 'PROGRESS':
        return 'processing';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'COMPLETED':
        return 'Completed';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'PENDING':
        return 'Pending';
      case 'RESCHEDULE':
        return 'Rescheduling';
      case 'PROGRESS':
        return 'In Progress';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    fetchBookings();
  };

  const handleCancelAppointment = (appointment) => {
    Modal.confirm({
      title: 'Cancel Appointment',
      content: (
        <div>
          <p>Are you sure you want to cancel this appointment?</p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
            <p className="mb-1">
              <span className="font-semibold">Vaccine:</span> {appointment.vaccineName}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Dose:</span> {appointment.doseNumber}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Date:</span>{' '}
              {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')}
            </p>
            <p className="mb-0">
              <span className="font-semibold">Center:</span> {appointment.centerName}
            </p>
          </div>
        </div>
      ),
      okText: 'Yes, Cancel',
      cancelText: 'Go Back',
      okButtonProps: { danger: true, shape: 'round' },
      cancelButtonProps: { shape: 'round' },
      onOk: async () => {
        try {
          await callCancelAppointment(appointment.appointmentId);
          message.success('Appointment cancelled successfully');
          fetchBookings();
        } catch (error) {
          message.error(error?.message || 'Failed to cancel appointment');
        }
      },
    });
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
    .sort((a, b) => dayjs(a.scheduledDate).valueOf() - dayjs(b.scheduledDate).valueOf());

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

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-end mb-4">
          <div>
            <Skeleton.Input active size="small" className="!w-48 mb-2" />
            <Skeleton.Input active size="small" className="!w-64 block" />
          </div>
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex justify-between mb-6">
              <div className="flex gap-4">
                <Skeleton.Avatar active size="large" shape="square" />
                <div>
                  <Skeleton.Input active size="small" className="!w-32 mb-1" />
                  <Skeleton.Input active size="small" className="!w-24" />
                </div>
              </div>
              <Skeleton.Button active size="small" />
            </div>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error loading data"
        description={error}
        showIcon
        className="rounded-xl"
      />
    );
  }

  if (upcomingAppointments.length === 0) {
    return (
      <div className="py-12 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-slate-500">No upcoming appointments</span>}
        />
        <Button
          type="primary"
          className="mt-4 rounded-xl shadow-lg shadow-blue-500/20"
          href="/booking"
        >
          Book New Appointment
        </Button>
      </div>
    );
  }

  const renderVaccineTimeline = (appointments) => {
    if (appointments.length === 0) return null;

    const firstApt = appointments[0];
    return (
      <Card
        className="!mb-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
        key={firstApt.bookingId}
      >
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MedicineBoxOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={5} className="!mb-0 text-slate-800">
                {firstApt.vaccineName}
              </Title>
              <Text className="text-slate-500 text-sm">
                Patient: <span className="font-medium text-slate-700">{firstApt.patientName}</span>{' '}
                • {firstApt.totalDoses} Doses
              </Text>
            </div>
          </div>
          <Tag
            color={getStatusColor(firstApt.bookingStatus)}
            className="rounded-full px-3 py-1 text-xs font-bold uppercase border-0"
          >
            {getStatusText(firstApt.bookingStatus)}
          </Tag>
        </div>

        <Timeline
          className="ml-2"
          items={appointments.map((apt) => ({
            dot:
              apt.appointmentStatus === 'CONFIRMED' ? (
                <CheckCircleFilled className="text-emerald-500 text-lg" />
              ) : (
                <ClockCircleFilled className="text-blue-500 text-lg" />
              ),
            children: (
              <div className="pb-6 pl-2">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Text strong className="text-slate-700 text-lg">
                        Dose {apt.doseNumber}
                      </Text>
                      <Tag
                        color={getStatusColor(apt.appointmentStatus)}
                        className="rounded-lg border-0 font-medium"
                      >
                        {getStatusText(apt.appointmentStatus)}
                      </Tag>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarOutlined className="text-blue-400" />
                        <span>
                          {dayjs(apt.scheduledDate).format('DD/MM/YYYY')} at{' '}
                          {formatAppointmentTime(apt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <EnvironmentOutlined className="text-red-400" />
                        <span>{apt.centerName}</span>
                      </div>
                      {apt.doctorName && (
                        <div className="flex items-center gap-2 text-slate-600 md:col-span-2">
                          <span className="font-medium">Doctor:</span> {apt.doctorName}
                        </div>
                      )}
                    </div>

                    {apt.appointmentStatus === 'RESCHEDULE' && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                        <SyncOutlined spin className="text-amber-500 mt-1" />
                        <Text className="text-amber-700 text-xs">
                          Reschedule request sent. Waiting for confirmation.
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {apt.appointmentStatus !== 'COMPLETED' &&
                    apt.appointmentStatus !== 'CANCELLED' &&
                    apt.appointmentStatus !== 'RESCHEDULE' &&
                    dayjs(apt.scheduledDate).isAfter(dayjs()) && (
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          className="rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200"
                          icon={<SyncOutlined />}
                          onClick={() => handleReschedule(apt)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          danger
                          size="small"
                          type="text"
                          className="rounded-lg hover:bg-red-50"
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleCancelAppointment(apt)}
                        >
                          Cancel
                        </Button>
                      </div>
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
    <div className="animate-fade-in">
      <div className="mb-6">
        <Title level={3} className="!mb-1 text-slate-800">
          Appointments
        </Title>
        <Text className="text-slate-500 text-lg">Manage your upcoming vaccination schedules</Text>
      </div>

      {selfBookings.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-700 m-0">My Schedule</h4>
            <Tag color="blue" className="rounded-full px-2">
              {selfBookings.length}
            </Tag>
          </div>
          {selfBookings.map((appointments) => renderVaccineTimeline(appointments))}
        </div>
      )}

      {familyBookings.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-700 m-0">Family Schedule</h4>
            <Tag color="purple" className="rounded-full px-2">
              {familyBookings.length}
            </Tag>
          </div>
          {familyBookings.map((appointments) => renderVaccineTimeline(appointments))}
        </div>
      )}

      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 rounded-3xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <CalendarOutlined />
          </div>
          <div>
            <Title level={5} className="!mb-2 text-blue-900">
              Pre-vaccination Instructions
            </Title>
            <ul className="text-sm text-blue-800 space-y-2 m-0 pl-4 list-disc">
              <li>Please arrive 15 minutes before your appointment time.</li>
              <li>Bring your ID card and health insurance card.</li>
              <li>Wear comfortable clothing for easy injection access.</li>
              <li>Inform medical staff of any allergies or medications.</li>
              <li>Eat properly before your vaccination.</li>
            </ul>
          </div>
        </div>
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
