import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callListAppointment } from '@/services/appointment.service';

const AppointmentListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchAppointments = async (params = {}) => {
    setLoading(true);
    try {
      const query = {
        page: params.current || pagination.current,
        size: params.pageSize || pagination.pageSize,
      };
      const res = await callListAppointment(query);
      if (res?.data?.result) {
        setData(res.data.result);
        setPagination({
          ...pagination,
          current: res.data.meta.page,
          pageSize: res.data.meta.pageSize,
          total: res.data.meta.total,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchAppointments({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const statusColors = {
    PENDING: 'orange',
    SCHEDULED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RESCHEDULE: 'purple',
  };

  const paymentStatusColors = {
    INITIATED: 'orange',
    PROCESSING: 'blue',
    SUCCESS: 'green',
    FAILED: 'red',
    REFUNDED: 'purple',
    CANCELLED: 'default',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-slate-500">{record.patientPhone}</div>
        </div>
      ),
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccine',
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined className="mr-1 text-slate-400" />
            {dayjs(record.scheduledDate).format('DD/MM/YYYY')}
          </div>
          <div className="text-xs text-slate-500">
            <ClockCircleOutlined className="mr-1" />
            {record.scheduledTimeSlot}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'appointmentStatus',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={paymentStatusColors[record.paymentStatus] || 'default'}>
            {record.paymentStatus || 'N/A'}
          </Tag>
          {record.paymentAmount && (
            <span className="text-xs text-slate-500">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                record.paymentAmount
              )}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/appointments/${record.id}`)}
              type="text"
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Appointment Management"
        extra={
          <Button icon={<SyncOutlined />} onClick={() => fetchAppointments()} loading={loading}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default AppointmentListPage;
