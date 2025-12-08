import { CheckCircleFilled, SyncOutlined } from '@ant-design/icons';
import { Alert, Card, Skeleton, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyBookingHistory } from '@/services/booking.service';
import { formatAppointmentTime } from '@/utils/appointment';

const { Title, Text } = Typography;

const VaccinationHistoryTab = () => {
  const { t } = useTranslation(['client']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookingHistory();
      const bookings = response.data || [];

      // Group appointments into routes
      const routes = {};

      bookings.forEach((booking) => {
        if (!booking.appointments) return;

        const required = booking.vaccineTotalDoses || 3;
        const patientName = booking.familyMemberName || booking.patientName;

        booking.appointments.forEach((apt) => {
          // Skip cancelled appointments if you don't want them in the route logic?
          // Or keep them for history. Let's keep them but handle status.

          const cycleIndex = Math.ceil(apt.doseNumber / required) - 1;
          const key = `${booking.vaccineName}-${patientName}-${cycleIndex}`;

          if (!routes[key]) {
            routes[key] = {
              routeId: key,
              vaccineName: booking.vaccineName,
              patientName: patientName,
              isFamily: !!booking.familyMemberName,
              requiredDoses: required,
              cycleIndex: cycleIndex,
              createdAt: booking.createdAt, // use first booking date
              appointments: [],
              totalAmount: 0,
            };
          }

          // Check if this appointment is already added (unlikely but safe)
          const existingApt = routes[key].appointments.find(
            (a) => a.appointmentId === apt.appointmentId
          );
          if (!existingApt) {
            routes[key].appointments.push({
              ...apt,
              bookingId: booking.bookingId,
              centerName: booking.centerName, // booking level center might differ from apt? usually apt has center info?
              // The API response for booking.appointments usually contains simplified apt object.
              // Check previous view: bookingColumns accessed nesting.
              // Let's assume apt doesn't have centerName, booking does.
              // Wait, Appointment entity has Center.
              // Let's use booking context for missing fields.
            });

            if (apt.appointmentStatus !== 'CANCELLED') {
              // Roughly add amount?
              // Issue: booking.totalAmount is for the whole booking.
              // If booking has multiple appointments (unlikely), we divide?
              // Usually 1 booking = 1 shot.
              routes[key].totalAmount += booking.totalAmount;
            }
          }
          // update latest date
          if (dayjs(booking.createdAt).isAfter(routes[key].createdAt)) {
            routes[key].createdAt = booking.createdAt;
          }
        });
      });

      const routeList = Object.values(routes).map((route) => {
        // Sort appointments
        route.appointments.sort((a, b) => a.doseNumber - b.doseNumber);

        // Determine status
        const completedCount = route.appointments.filter(
          (a) => a.appointmentStatus === 'COMPLETED'
        ).length;
        const activeCount = route.appointments.filter(
          (a) => a.appointmentStatus !== 'CANCELLED'
        ).length;
        // Status logic:
        // If completedCount >= requiredDoses -> COMPLETED
        // Else IN_PROGRESS

        let status = 'IN_PROGRESS';
        if (completedCount >= route.requiredDoses) {
          status = 'COMPLETED';
        } else if (activeCount === 0) {
          status = 'CANCELLED'; // All cancelled
        }

        return {
          ...route,
          completedCount,
          status,
        };
      });

      // Sort by date desc
      routeList.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix());

      setGroupedHistory(routeList);

      setStats({
        total: routeList.length,
        completed: routeList.filter((r) => r.status === 'COMPLETED').length,
        inProgress: routeList.filter((r) => r.status === 'IN_PROGRESS').length,
      });
    } catch (_err) {
      console.error(_err);
      setError(t('client:vaccinationHistory.errorLoadHistory'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'processing';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return t('client:vaccinationHistory.completed');
      case 'IN_PROGRESS':
        return t('client:vaccinationHistory.inProgress');
      case 'CANCELLED':
        return t('client:appointments.cancelled');
      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return <Skeleton active />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const routeColumns = [
    {
      title: t('client:vaccinationHistory.vaccine'), // "Route/Vaccine"
      key: 'vaccine',
      render: (_, record) => (
        <div>
          <Text strong className="text-lg text-blue-900">
            {record.vaccineName}
          </Text>
          <div className="text-xs text-slate-500">
            {t('client:myRecords.progress')}: {record.completedCount}/{record.requiredDoses}{' '}
            {t('client:vaccinationHistory.doses')}
            {record.cycleIndex > 0 && (
              <Tag className="ml-2">
                {t('client:vaccinationHistory.cycle', {
                  count: record.cycleIndex + 1,
                  defaultValue: `Cycle ${record.cycleIndex + 1}`,
                })}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('client:vaccinationHistory.patient'),
      key: 'patient',
      render: (_, record) => (
        <div>
          <Text className="font-medium text-slate-700">{record.patientName}</Text>
          {record.isFamily && (
            <Tag
              color="purple"
              className="ml-2 rounded-md bg-purple-50 text-purple-600 border-0 text-[10px]"
            >
              {t('client:vaccinationHistory.familyMember')}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: t('client:vaccinationHistory.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (val) => <span className="font-bold text-slate-700">{formatPrice(val)}</span>,
    },
    {
      title: t('client:vaccinationHistory.status'),
      key: 'status',
      render: (_, record) => (
        <Tag
          color={getStatusColor(record.status)}
          icon={record.status === 'COMPLETED' ? <CheckCircleFilled /> : <SyncOutlined spin />}
        >
          {getStatusText(record.status)}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (route) => {
    // Show appointments
    const columns = [
      {
        title: t('client:vaccinationHistory.dose'),
        dataIndex: 'doseNumber',
        key: 'dose',
        width: 80,
        render: (d) => (
          <Tag color="blue">
            {t('client:vaccinationHistory.dose')} {d}
          </Tag>
        ),
      },
      {
        title: t('client:vaccinationHistory.scheduledDate'),
        dataIndex: 'scheduledDate',
        key: 'date',
        render: (d, r) => (
          <div>
            <div>{dayjs(d).format('DD/MM/YYYY')}</div>
            <div className="text-xs text-slate-400">{formatAppointmentTime(r)}</div>
          </div>
        ),
      },
      {
        title: t('client:vaccinationHistory.center'),
        dataIndex: 'centerName', // Need to ensure mapped correctly
        key: 'center',
        render: (v) => <span className="text-slate-600">{v || 'N/A'}</span>,
      },
      {
        title: t('client:vaccinationHistory.status'),
        dataIndex: 'appointmentStatus',
        key: 'status',
        render: (s) => (
          <Tag color={s === 'COMPLETED' ? 'success' : s === 'CANCELLED' ? 'error' : 'warning'}>
            {s}
          </Tag>
        ),
      },
    ];

    return (
      <div className="p-4 bg-slate-50 rounded-xl">
        <Text strong className="mb-2 block">
          {t('client:vaccinationHistory.appointmentDetails')}
        </Text>
        <Table
          columns={columns}
          dataSource={route.appointments}
          pagination={false}
          size="small"
          rowKey="appointmentId"
        />
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6">
        <Title level={3} className="!mb-1 text-slate-800">
          {t('client:vaccinationHistory.title')}
        </Title>
        <Text className="text-slate-500 text-lg">
          {t('client:vaccinationHistory.trackBookings')}
        </Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.totalBookings')} (Routes)
            </Text>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.completed}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.completed')}
            </Text>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-orange-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.inProgress}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.inProgress')}
            </Text>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          dataSource={groupedHistory}
          columns={routeColumns}
          rowKey="routeId"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default VaccinationHistoryTab;
