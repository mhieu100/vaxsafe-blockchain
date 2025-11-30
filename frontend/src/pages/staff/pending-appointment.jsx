import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { ApproveRescheduleModal, AssignAppointmentModal } from '@/components/modal/appointment';
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
import { useAppointmentStore } from '../../stores/useAppointmentStore';

const { Title, Text } = Typography;
const { Option } = Select;

const PendingAppointmentPage = () => {
  const tableRef = useRef();

  const isFetching = useAppointmentStore((state) => state.isFetching);
  const meta = useAppointmentStore((state) => state.meta);
  const appointments = useAppointmentStore((state) => state.result);
  const fetchAppointmentOfCenter = useAppointmentStore((state) => state.fetchAppointmentOfCenter);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('');

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  // Calculate statistics from appointments
  const statistics = {
    pendingSchedule: appointments.filter((apt) => apt.status === AppointmentStatus.PENDING).length,
    pendingApproval: appointments.filter((apt) => apt.status === AppointmentStatus.RESCHEDULE)
      .length,
    urgent: appointments.filter((apt) => {
      const desiredDate = apt.desiredDate || apt.scheduledDate;
      return desiredDate && dayjs(desiredDate).diff(dayjs(), 'day') <= 1;
    }).length,
    total: appointments.length,
  };

  const handleAssignAppointment = (record) => {
    setSelectedAppointment(record);
    setOpenAssignModal(true);
  };

  const handleApplyFilters = () => {
    reloadTable();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setVaccineFilter('');
    setDateFilter(null);
    setPriorityFilter('');
    reloadTable();
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
        <Space orientation="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <Text strong>{text}</Text>
            {record.status === 'RESCHEDULE' && (
              <Tag color="orange" style={{ fontSize: 10 }}>
                Đổi lịch
              </Tag>
            )}
          </Space>
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
      dataIndex: 'scheduledDate',
      width: 150,
      render: (text, record) => {
        const dateToShow = text || record.scheduledDate;
        const timeSlotToShow = record.desiredTimeSlot || record.scheduledTimeSlot;
        const isUrgent = dayjs(dateToShow).diff(dayjs(), 'day') <= 1;
        const _isReschedule = record.status === 'RESCHEDULE';

        return (
          <Space orientation="vertical" size={0}>
            <Space>
              <Text strong style={{ color: isUrgent ? '#ff4d4f' : undefined }}>
                {dayjs(dateToShow).format('DD/MM/YYYY')}
              </Text>
              {isUrgent && (
                <Tag color="red" icon={<ClockCircleOutlined />}>
                  GẤP
                </Tag>
              )}
            </Space>
            {timeSlotToShow && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {TIME_SLOT_LABELS[timeSlotToShow] || timeSlotToShow}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Ngày Chính Thức',
      dataIndex: 'scheduledDate',
      width: 180,
      render: (text, record) => {
        const dateToShow = text || record.scheduledDate;
        const _timeSlotToShow = record.desiredTimeSlot || record.scheduledTimeSlot;
        const actualTimeToShow = record.actualDesiredTime || record.actualScheduledTime;
        const isUrgent = dayjs(dateToShow).diff(dayjs(), 'day') <= 1;
        const isReschedule = record.status === 'RESCHEDULE';

        return (
          <Space orientation="vertical" size={0}>
            <Space>
              <Text strong style={{ color: isUrgent ? '#ff4d4f' : undefined }}>
                {dayjs(dateToShow).format('DD/MM/YYYY')}
              </Text>
              {isUrgent && (
                <Tag color="red" icon={<ClockCircleOutlined />}>
                  GẤP
                </Tag>
              )}
            </Space>

            {actualTimeToShow ? (
              <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                Giờ chính thức: {actualTimeToShow.substring(0, 5)}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                Chờ xếp lịch...
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
      title: 'Trung Tâm',
      dataIndex: 'centerName',
      width: 180,
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
      width: 200,
      render: (status, record) => {
        if (!status) {
          return (
            <Space orientation="vertical" size={0}>
              <Tag color="default">Chưa thanh toán</Tag>
            </Space>
          );
        }

        const statusLabels = {
          [PaymentStatus.SUCCESS]: 'Thành công',
          [PaymentStatus.PROCESSING]: 'Đang xử lý',
          [PaymentStatus.INITIATED]: 'Đã tạo',
          [PaymentStatus.FAILED]: 'Thất bại',
        };

        const paymentDisplay =
          record.paymentAmount != null && record.paymentMethod
            ? formatPaymentAmount(record.paymentAmount, record.paymentMethod)
            : null;

        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <Tag color={getPaymentStatusColor(status)} className="!m-0">
              {statusLabels[status] || status}
            </Tag>
            {record.paymentMethod && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getPaymentMethodDisplay(record.paymentMethod)}
              </Text>
            )}
            {paymentDisplay && (
              <>
                {paymentDisplay.original && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {paymentDisplay.original.formatted}
                  </Text>
                )}
                <Text strong style={{ fontSize: 13, color: '#1890ff' }}>
                  {paymentDisplay.display}
                </Text>
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isPendingSchedule = record.status === AppointmentStatus.PENDING;
        const isPendingApproval = record.status === AppointmentStatus.RESCHEDULE;
        const needsAction = isPendingSchedule || isPendingApproval;

        if (needsAction) {
          return (
            <Space orientation="vertical" size="small">
              <Tooltip title={isPendingApproval ? 'Duyệt đổi lịch' : 'Phân công lịch hẹn'}>
                <Button
                  type={isPendingApproval ? 'default' : 'primary'}
                  icon={isPendingApproval ? <CheckSquareOutlined /> : <CalendarOutlined />}
                  onClick={() => handleAssignAppointment(record)}
                  style={
                    isPendingApproval
                      ? {
                          background: '#fff7e6',
                          borderColor: '#ffa940',
                          color: '#fa8c16',
                        }
                      : {}
                  }
                  block
                >
                  {isPendingApproval ? 'Duyệt Đổi Lịch' : 'Phân Công'}
                </Button>
              </Tooltip>
              {isPendingApproval && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Yêu cầu đổi lịch
                </Text>
              )}
            </Space>
          );
        }

        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
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

    // Add filters
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
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size="middle">
          <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Lịch Hẹn Chờ Xếp
            </Title>
            <Text type="secondary">Quản lý và phân công lịch hẹn chưa xếp lịch</Text>
          </div>
          <Badge count={statistics.pending} style={{ backgroundColor: '#faad14' }} />
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <span>Chờ Xếp Lịch</span>
                </Space>
              }
              value={statistics.pendingSchedule}
              suffix="lịch hẹn"
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <EditOutlined style={{ color: '#faad14' }} />
                  <span>Chờ Duyệt Đổi Lịch</span>
                </Space>
              }
              value={statistics.pendingApproval}
              suffix="yêu cầu"
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>Cần Xử Lý Gấp</span>
                </Space>
              }
              value={statistics.urgent}
              suffix="lịch hẹn"
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <Space>
                  <CheckSquareOutlined style={{ color: '#52c41a' }} />
                  <span>Tổng Cần Xử Lý</span>
                </Space>
              }
              value={statistics.total}
              suffix="lịch hẹn"
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        style={{ marginBottom: 24 }}
        title={
          <Space>
            <FilterOutlined /> Bộ Lọc
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm tên, SĐT, Mã LH..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Chọn vaccine"
              style={{ width: '100%' }}
              value={vaccineFilter}
              onChange={setVaccineFilter}
              allowClear
            >
              <Option value="">Tất cả</Option>
              <Option value="COVID-19">COVID-19</Option>
              <Option value="Cúm">Cúm</Option>
              <Option value="Viêm Gan B">Viêm Gan B</Option>
              <Option value="HPV">HPV</Option>
              <Option value="Sởi">Sởi</Option>
            </Select>
          </Col>
          <Col xs={24} md={5}>
            <DatePicker
              placeholder="Ngày mong muốn"
              style={{ width: '100%' }}
              value={dateFilter}
              onChange={setDateFilter}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Ưu tiên"
              style={{ width: '100%' }}
              value={priorityFilter}
              onChange={setPriorityFilter}
              allowClear
            >
              <Option value="">Tất cả</Option>
              <Option value="urgent">Gấp</Option>
              <Option value="normal">Bình thường</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                Áp dụng
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
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

      {/* Conditional Modal Rendering */}
      {selectedAppointment?.status === 'RESCHEDULE' ? (
        <ApproveRescheduleModal
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          appointment={selectedAppointment}
          onSuccess={reloadTable}
        />
      ) : (
        <AssignAppointmentModal
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          appointment={selectedAppointment}
          onSuccess={reloadTable}
        />
      )}
    </div>
  );
};

export default PendingAppointmentPage;
