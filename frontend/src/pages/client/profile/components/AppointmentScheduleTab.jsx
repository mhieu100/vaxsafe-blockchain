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
import { useTranslation } from 'react-i18next';
import { callCancelAppointment } from '@/services/appointment.service';
import { getMyBookings } from '@/services/booking.service';
import { formatAppointmentTime } from '@/utils/appointment';
import RescheduleAppointmentModal from './RescheduleAppointmentModal';

const { Title, Text } = Typography;

const AppointmentScheduleTab = () => {
  const { t } = useTranslation(['client']);
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
      setError(err?.message || t('client:appointments.errorLoading'));
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
        return t('client:vaccinationHistory.completed');
      case 'SCHEDULED':
        return 'Scheduled';
      case 'PENDING':
        return t('client:vaccinationHistory.pending');
      case 'RESCHEDULE':
        return 'Rescheduling';
      case 'PROGRESS':
        return t('client:vaccinationHistory.inProgress');
      case 'CANCELLED':
        return t('client:appointments.cancelled');
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
      title: t('client:appointments.cancelAppointment'),
      content: (
        <div>
          <p>{t('client:appointments.confirmCancel')}</p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
            <p className="mb-1">
              <span className="font-semibold">{t('client:vaccinationHistory.vaccine')}:</span>{' '}
              {appointment.vaccineName}
            </p>
            <p className="mb-1">
              <span className="font-semibold">{t('client:vaccinationHistory.dose')}:</span>{' '}
              {appointment.doseNumber}
            </p>
            <p className="mb-1">
              <span className="font-semibold">{t('client:vaccinationHistory.date')}:</span>{' '}
              {dayjs(appointment.scheduledDate).format('DD/MM/YYYY')}
            </p>
            <p className="mb-0">
              <span className="font-semibold">{t('client:vaccinationHistory.center')}:</span>{' '}
              {appointment.centerName}
            </p>
          </div>
        </div>
      ),
      okText: t('client:appointments.yesCancel'),
      cancelText: t('client:appointments.goBack'),
      okButtonProps: { danger: true, shape: 'round' },
      cancelButtonProps: { shape: 'round' },
      onOk: async () => {
        try {
          await callCancelAppointment(appointment.appointmentId);
          message.success(t('client:appointments.cancelSuccess'));
          fetchBookings();
        } catch (error) {
          message.error(error?.message || t('client:appointments.cancelFailed'));
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
        title={t('client:appointments.errorLoading')}
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
          description={
            <span className="text-slate-500">{t('client:appointments.noUpcoming')}</span>
          }
        />
        <Button
          type="primary"
          className="mt-4 rounded-xl shadow-lg shadow-blue-500/20"
          href="/vaccine"
        >
          {t('client:appointments.bookNew')}
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
                {t('client:vaccinationHistory.patient')}:{' '}
                <span className="font-medium text-slate-700">{firstApt.patientName}</span> •{' '}
                {firstApt.totalDoses} {t('client:vaccinationHistory.doses')}
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
                        {t('client:vaccinationHistory.dose')} {apt.doseNumber}
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
                          <span className="font-medium">
                            {t('client:vaccinationHistory.doctor')}:
                          </span>{' '}
                          {apt.doctorName}
                        </div>
                      )}
                    </div>

                    {apt.appointmentStatus === 'RESCHEDULE' && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                        <SyncOutlined spin className="text-amber-500 mt-1" />
                        <Text className="text-amber-700 text-xs">
                          {t('client:appointments.rescheduleRequestSent')}
                        </Text>
                      </div>
                    )}
                  </div>

                  {}
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
                          {t('client:appointments.reschedule')}
                        </Button>
                        <Button
                          danger
                          size="small"
                          type="text"
                          className="rounded-lg hover:bg-red-50"
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleCancelAppointment(apt)}
                        >
                          {t('client:profile.cancel')}
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
          {t('client:sidebar.appointments')}
        </Title>
        <Text className="text-slate-500 text-lg">{t('client:appointments.manageSchedules')}</Text>
      </div>

      {selfBookings.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-700 m-0">
              {t('client:appointments.mySchedule')}
            </h4>
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
            <h4 className="text-lg font-bold text-slate-700 m-0">
              {t('client:appointments.familySchedule')}
            </h4>
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
              {t('client:appointments.preVaccinationInstructions')}
            </Title>
            <ul className="text-sm text-blue-800 space-y-2 m-0 pl-4 list-disc">
              <li>{t('client:appointments.instruction1')}</li>
              <li>{t('client:appointments.instruction2')}</li>
              <li>{t('client:appointments.instruction3')}</li>
              <li>{t('client:appointments.instruction4')}</li>
              <li>{t('client:appointments.instruction5')}</li>
            </ul>
          </div>
        </div>
      </Card>

      {}
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
