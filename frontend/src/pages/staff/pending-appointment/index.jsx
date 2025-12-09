import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PhoneOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { TIME_SLOT_LABELS } from '@/constants';
import {
  AppointmentStatus,
  formatPaymentAmount,
  getAppointmentStatusColor,
  getAppointmentStatusDisplay,
  getPaymentMethodDisplay,
  getPaymentStatusColor,
  PaymentStatus,
} from '@/constants/enums';
import { useAppointmentStore } from '@/stores/useAppointmentStore';
import ProcessUrgentAppointmentModal from '../dashboard/components/ProcessUrgentAppointmentModal';

const { Text } = Typography;

const PendingAppointmentPage = () => {
  const tableRef = useRef();

  const isFetching = useAppointmentStore((state) => state.isFetching);
  const meta = useAppointmentStore((state) => state.meta);
  const appointments = useAppointmentStore((state) => state.result);
  const fetchAppointmentOfCenter = useAppointmentStore((state) => state.fetchAppointmentOfCenter);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [searchText] = useState('');
  const [vaccineFilter] = useState('');
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const handleAssignAppointment = (record) => {
    setSelectedAppointment(record);
    setOpenAssignModal(true);
  };

  const columns = [
    {
      title: 'Mã LH',
      dataIndex: 'id',
      width: 100,
      fixed: 'left',
      render: (text) => (
        <Text strong style={{ color: '#1890ff' }}>
          #{text}
        </Text>
      ),
    },
    {
      title: 'Bệnh Nhân',
      dataIndex: 'patientName',
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size={4}>
          <Space>
            <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{text}</Text>
          </Space>
          {record.status === 'RESCHEDULE' && (
            <Tag color="orange" icon={<EditOutlined />} style={{ fontSize: 11 }}>
              Đổi lịch
            </Tag>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined /> {record.patientPhone || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'desiredDate',
      width: 160,
      render: (_text, record) => {
        const dateToShow = record.desiredDate || record.scheduledDate;
        const timeSlotToShow = record.desiredTimeSlot || record.scheduledTimeSlot;
        const isUrgent = dateToShow && dayjs(dateToShow).diff(dayjs(), 'day') <= 1;

        return (
          <Space direction="vertical" size={4}>
            <Space>
              <ClockCircleOutlined style={{ color: isUrgent ? '#ff4d4f' : '#1890ff' }} />
              <Text strong style={{ color: isUrgent ? '#ff4d4f' : undefined }}>
                {dateToShow ? dayjs(dateToShow).format('DD/MM/YYYY') : 'N/A'}
              </Text>
            </Space>
            {timeSlotToShow && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {TIME_SLOT_LABELS[timeSlotToShow] || timeSlotToShow}
              </Text>
            )}
            {isUrgent && (
              <Tag color="red" icon={<ClockCircleOutlined />} style={{ fontSize: 11 }}>
                GẤP
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Ngày Chính Thức',
      dataIndex: 'scheduledDate',
      width: 180,
      render: (_text, record) => {
        const scheduledDate = record.scheduledDate;
        const actualTime = record.actualScheduledTime || record.actualDesiredTime;
        const isReschedule = record.status === 'RESCHEDULE';
        const isPending = record.status === AppointmentStatus.PENDING;

        if (!scheduledDate || isPending) {
          return (
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                Chờ xếp lịch...
              </Text>
              {isReschedule && record.rescheduledAt && (
                <Text type="warning" style={{ fontSize: 11 }}>
                  Đổi lúc: {dayjs(record.rescheduledAt).format('DD/MM HH:mm')}
                </Text>
              )}
            </Space>
          );
        }

        return (
          <Space direction="vertical" size={4}>
            <Space>
              <CalendarOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a' }}>
                {dayjs(scheduledDate).format('DD/MM/YYYY')}
              </Text>
            </Space>
            {actualTime && (
              <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                Giờ chính thức: {actualTime.substring(0, 5)}
              </Text>
            )}
            {isReschedule && record.rescheduledAt && (
              <Text type="warning" style={{ fontSize: 11 }}>
                Đổi lúc: {dayjs(record.rescheduledAt).format('DD/MM HH:mm')}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trung Tâm / Bác Sĩ',
      dataIndex: 'centerName',
      width: 220,
      render: (text, record) => {
        const doctorName = record.doctorName;
        return (
          <Space direction="vertical" size={4}>
            <Text strong>{text}</Text>
            {doctorName ? (
              <Space>
                <UserOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {doctorName}
                </Text>
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                Chờ chỉ định bác sĩ...
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      width: 150,
      render: (status) => (
        <Tag color={getAppointmentStatusColor(status)}>{getAppointmentStatusDisplay(status)}</Tag>
      ),
    },
    {
      title: 'Thanh Toán',
      dataIndex: 'paymentStatus',
      width: 180,
      render: (status, record) => {
        const statusLabels = {
          [PaymentStatus.SUCCESS]: 'Đã phản công',
          [PaymentStatus.PROCESSING]: 'Đang xử lý',
          [PaymentStatus.INITIATED]: 'Tiền mặt',
          [PaymentStatus.FAILED]: 'Thất bại',
        };

        const paymentDisplay =
          record.paymentAmount != null && record.paymentMethod
            ? formatPaymentAmount(record.paymentAmount, record.paymentMethod)
            : null;

        return (
          <Space direction="vertical" size={4}>
            <Tag color={getPaymentStatusColor(status)} style={{ marginBottom: 4 }}>
              {statusLabels[status] || status || 'Chưa có'}
            </Tag>
            {paymentDisplay ? (
              <>
                {record.paymentMethod && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {getPaymentMethodDisplay(record.paymentMethod)}
                  </Text>
                )}

                <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                  {paymentDisplay.display}
                </Text>
              </>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Chưa thanh toán
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const isPendingSchedule = record.status === AppointmentStatus.PENDING;
        const isPendingApproval = record.status === AppointmentStatus.RESCHEDULE;
        const needsAction = isPendingSchedule || isPendingApproval;

        if (needsAction) {
          return (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {isPendingApproval ? (
                <>
                  <Button
                    type="primary"
                    danger
                    icon={<CheckSquareOutlined />}
                    onClick={() => handleAssignAppointment(record)}
                    block
                    style={{
                      background: '#ff7a45',
                      borderColor: '#ff7a45',
                    }}
                  >
                    Duyệt Đổi Lịch
                  </Button>
                  <Text type="warning" style={{ fontSize: 11, textAlign: 'center' }}>
                    Yêu cầu đổi lịch
                  </Text>
                </>
              ) : (
                <Tooltip title="Phân công lịch hẹn cho bác sĩ">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={() => handleAssignAppointment(record)}
                    block
                  >
                    Phân Công
                  </Button>
                </Tooltip>
              )}
            </Space>
          );
        }

        return (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '4px 12px' }}>
            Đã phân công
          </Tag>
        );
      },
    },
  ];

  const buildQuery = (params, _sort) => {
    const clone = { ...params };
    const q = {
      page: params.current,
      size: params.pageSize,
      filter: '',
    };

    const filters = [];

    if (searchText) {
      filters.push(`(${sfLike('patientName', searchText)} or ${sfLike('id', searchText)})`);
    }
    if (vaccineFilter) {
      filters.push(sfLike('vaccineName', vaccineFilter));
    }
    if (clone.vaccineName) {
      filters.push(sfLike('vaccineName', clone.vaccineName));
    }
    if (clone.centerName) {
      filters.push(sfLike('centerName', clone.centerName));
    }

    q.filter = filters.join(' and ');
    if (!q.filter) delete q.filter;

    return queryString.stringify(q);
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Danh Sách Lịch Hẹn</span>
            <Tag color="warning">{meta.total || 0} lịch hẹn</Tag>
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={reloadTable}>
            Làm mới
          </Button>
        }
      >
        <DataTable
          actionRef={tableRef}
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={appointments}
          request={async (params, sort, filter) => {
            const query = buildQuery(params, sort, filter);
            fetchAppointmentOfCenter(query);
          }}
          scroll={{ x: 1500 }}
          pagination={{
            current: meta.page,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => (
              <Text>
                Hiển thị {range[0]}-{range[1]} trong tổng số {total} lịch hẹn
              </Text>
            ),
          }}
          rowSelection={false}
        />
      </Card>

      {}
      <ProcessUrgentAppointmentModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        appointment={
          selectedAppointment
            ? {
                ...selectedAppointment,
                urgencyType:
                  selectedAppointment.status === 'RESCHEDULE' ? 'RESCHEDULE_PENDING' : 'NO_DOCTOR',
              }
            : null
        }
        onSuccess={reloadTable}
      />
    </div>
  );
};

export default PendingAppointmentPage;
