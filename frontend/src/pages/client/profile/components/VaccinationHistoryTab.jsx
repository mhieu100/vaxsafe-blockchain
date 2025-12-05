import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
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
  const [historyData, setHistoryData] = useState([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookingHistory();

      if (response.data) {
        setHistoryData(response.data);
      }
    } catch (_err) {
      setError(t('client:vaccinationHistory.errorLoadHistory'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircleFilled />;
      case 'PENDING':
      case 'CONFIRMED':
        return <ClockCircleFilled />;
      case 'CANCELLED':
        return <CloseCircleFilled />;
      case 'PROGRESS':
        return <SyncOutlined spin />;
      default:
        return <LoadingOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'blue';
      case 'CANCELLED':
        return 'error';
      case 'PROGRESS':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return t('client:vaccinationHistory.completed');
      case 'PENDING':
        return t('client:vaccinationHistory.pending');
      case 'CONFIRMED':
        return 'Confirmed'; // Assuming this status might exist, or map to pending/completed
      case 'CANCELLED':
        return t('client:appointments.cancelled');
      case 'PROGRESS':
        return t('client:vaccinationHistory.inProgress');
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
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm border border-slate-100">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: 60 }} />
            </Card>
          ))}
        </div>
        <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert title="Error" description={error} type="error" showIcon className="mb-4 rounded-xl" />
    );
  }

  // Main booking columns
  const bookingColumns = [
    {
      title: t('client:vaccinationHistory.bookingId'),
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id) => (
        <Text strong className="font-mono text-slate-600">
          #{id}
        </Text>
      ),
    },
    {
      title: t('client:vaccinationHistory.vaccine'),
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      render: (text, record) => (
        <div>
          <Text strong className="text-slate-800">
            {text}
          </Text>
          <div className="text-xs text-slate-500">
            {record.totalDoses} {t('client:vaccinationHistory.doses')}
          </div>
        </div>
      ),
    },
    {
      title: t('client:vaccinationHistory.patient'),
      key: 'patient',
      render: (_, record) => (
        <div>
          <Text className="font-medium text-slate-700">
            {record.familyMemberName || record.patientName}
          </Text>
          {record.familyMemberName && (
            <div>
              <Tag
                color="purple"
                className="!mt-1 rounded-md border-0 bg-purple-50 text-purple-600 text-xs"
              >
                {t('client:vaccinationHistory.familyMember')}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('client:vaccinationHistory.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-slate-600">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: t('client:vaccinationHistory.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="font-bold text-blue-600">{formatPrice(amount)}</span>,
    },
    {
      title: t('client:vaccinationHistory.status'),
      key: 'status',
      render: (_, record) => (
        <Tag
          color={getStatusColor(record.bookingStatus)}
          icon={getStatusIcon(record.bookingStatus)}
          className="rounded-full px-3 py-1 border-0 font-medium"
        >
          {getStatusText(record.bookingStatus)}
        </Tag>
      ),
    },
  ];

  // Appointment detail columns (for expanded row)
  const appointmentColumns = [
    {
      title: t('client:vaccinationHistory.dose'),
      dataIndex: 'doseNumber',
      key: 'doseNumber',
      width: 80,
      render: (num) => (
        <Tag color="blue" className="!m-0 rounded-md">
          {t('client:vaccinationHistory.dose')} {num}
        </Tag>
      ),
    },
    {
      title: t('client:vaccinationHistory.scheduledDate'),
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date, record) => (
        <div>
          <div className="font-medium text-slate-700">{dayjs(date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" className="text-xs">
            {formatAppointmentTime(record)}
          </Text>
        </div>
      ),
    },
    {
      title: t('client:vaccinationHistory.center'),
      dataIndex: 'centerName',
      key: 'centerName',
      render: (name) => <span className="text-slate-600">{name}</span>,
    },
    {
      title: t('client:vaccinationHistory.doctor'),
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (text) => (
        <Text type={!text ? 'secondary' : undefined}>
          {text || t('client:vaccinationHistory.notAssigned')}
        </Text>
      ),
    },
    {
      title: t('client:vaccinationHistory.cashier'),
      dataIndex: 'cashierName',
      key: 'cashierName',
      render: (text) => (
        <Text type={!text ? 'secondary' : undefined}>
          {text || t('client:vaccinationHistory.unpaid')}
        </Text>
      ),
    },
    {
      title: t('client:vaccinationHistory.status'),
      dataIndex: 'appointmentStatus',
      key: 'appointmentStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-md border-0">
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="mb-3">
          <Text strong className="text-slate-700">
            {t('client:vaccinationHistory.appointmentDetails')}
          </Text>
        </div>
        <Table
          dataSource={record.appointments}
          columns={appointmentColumns}
          pagination={false}
          rowKey="appointmentId"
          size="small"
          className="bg-transparent"
        />
      </div>
    );
  };

  const totalCompleted = historyData.filter(
    (booking) => booking.bookingStatus === 'COMPLETED'
  ).length;
  const totalInProgress = historyData.filter(
    (booking) => booking.bookingStatus === 'CANCELLED'
  ).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Title level={3} className="!mb-1 text-slate-800">
          {t('client:vaccinationHistory.title')}
        </Title>
        <Text className="text-slate-500 text-lg">
          {t('client:vaccinationHistory.trackBookings')}
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{historyData.length}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.totalBookings')}
            </Text>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">{totalCompleted}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.completed')}
            </Text>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-orange-50 to-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{totalInProgress}</div>
            <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
              {t('client:vaccinationHistory.inProgress')}
            </Text>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          dataSource={historyData}
          columns={bookingColumns}
          rowKey="bookingId"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              t('client:vaccinationHistory.totalBookingsCount', { count: total }),
          }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default VaccinationHistoryTab;
