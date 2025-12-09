import { CheckCircleFilled, SyncOutlined } from '@ant-design/icons';
import { Alert, Card, Skeleton, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getGroupedBookingHistory } from '@/services/booking.service';
import { formatAppointmentTime } from '@/utils/appointment';

const { Title, Text } = Typography;

const VaccinationHistoryTab = ({ customData }) => {
  const { t } = useTranslation(['client']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGroupedBookingHistory();
      const routeList = response.data || [];

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
    if (customData) {
      setGroupedHistory(customData);
      setStats({
        total: customData.length,
        completed: customData.filter((r) => r.status === 'COMPLETED').length,
        inProgress: customData.filter((r) => r.status === 'IN_PROGRESS').length,
      });
    } else {
      fetchHistory();
    }
  }, [customData]);

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
        key: 'appointmentStatus',
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
          rowKey="id"
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
