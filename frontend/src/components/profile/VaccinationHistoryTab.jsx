import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Alert, Card, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getMyBookingHistory } from '../../services/booking.service';

const { Title, Text } = Typography;

const VaccinationHistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookingHistory();

      if (response.data) {
        setHistoryData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch booking history:', err);
      setError('Không thể tải lịch sử tiêm chủng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircleOutlined />;
      case 'PENDING':
      case 'CONFIRMED':
        return <ClockCircleOutlined />;
      case 'CANCELLED':
        return <CloseCircleOutlined />;
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
        return 'Hoàn thành';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'PROGRESS':
        return 'Đang tiến hành';
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
      <div className="flex justify-center items-center py-12">
        <Spin size="large" tip="Đang tải lịch sử tiêm chủng..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon className="mb-4" />;
  }

  // Main booking columns
  const bookingColumns = [
    {
      title: 'Mã Booking',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div className="text-xs text-gray-500">{record.totalDoses} mũi tiêm</div>
        </div>
      ),
    },
    {
      title: 'Người tiêm',
      key: 'patient',
      render: (_, record) => (
        <div>
          <Text>{record.familyMemberName || record.patientName}</Text>
          {record.familyMemberName && (
            <div>
              <Tag color="purple" className="!mt-1">
                Thành viên gia đình
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <p className="text-blue-600">{formatPrice(amount)}</p>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <div className="space-y-1">
          <div>
            <Tag
              color={getStatusColor(record.bookingStatus)}
              icon={getStatusIcon(record.bookingStatus)}
            >
              {getStatusText(record.bookingStatus)}
            </Tag>
          </div>
          <div>
            <Tag color={getStatusColor(record.bookingStatus)} className="text-xs">
              {getStatusText(record.bookingStatus)}
            </Tag>
          </div>
        </div>
      ),
    },
  ];

  // Appointment detail columns (for expanded row)
  const appointmentColumns = [
    {
      title: 'Mũi',
      dataIndex: 'doseNumber',
      key: 'doseNumber',
      width: 80,
      render: (num) => (
        <Tag color="blue" className="!m-0">
          Mũi {num}
        </Tag>
      ),
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date, record) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" className="text-xs">
            {record.scheduledTime}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (text) => (
        <Text type={!text ? 'secondary' : undefined}>{text || 'Chưa phân công'}</Text>
      ),
    },
    {
      title: 'Thu ngân',
      dataIndex: 'cashierName',
      key: 'cashierName',
      render: (text) => (
        <Text type={!text ? 'secondary' : undefined}>{text || 'Chưa thanh toán'}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'appointmentStatus',
      key: 'appointmentStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-3">
          <Text strong>Lịch hẹn chi tiết</Text>
        </div>
        <Table
          dataSource={record.appointments}
          columns={appointmentColumns}
          pagination={false}
          rowKey="appointmentId"
          size="small"
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
    <div>
      <div className="mb-4">
        <Title level={4}>Lịch sử tiêm chủng</Title>
        <Text type="secondary">Tất cả các booking tiêm chủng của bạn và gia đình</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{historyData.length}</div>
            <Text type="secondary">Tổng số booking</Text>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <Text type="secondary">Hoàn thành</Text>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalInProgress}</div>
            <Text type="secondary">Đang tiến hành</Text>
          </div>
        </Card>
      </div>

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
          showTotal: (total) => `Tổng ${total} booking`,
        }}
      />
    </div>
  );
};

export default VaccinationHistoryTab;
