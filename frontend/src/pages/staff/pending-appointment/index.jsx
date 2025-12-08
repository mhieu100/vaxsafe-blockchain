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

  const [searchText, setSearchText] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('');

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

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
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size="middle">
          <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Lịch Hẹn Chờ Xếp
            </Title>
            <Text type="secondary">Quản lý và phân công lịch hẹn chưa xếp lịch</Text>
          </div>
          <Badge
            count={statistics.pendingSchedule + statistics.pendingApproval}
            style={{ backgroundColor: '#faad14' }}
            overflowCount={999}
          />
        </Space>
      </div>

      {}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false}>
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <span>Chờ Xếp Lịch</span>
                </Space>
              }
              value={statistics.pendingSchedule}
              suffix="lịch hẹn"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false}>
            <Statistic
              title={
                <Space>
                  <EditOutlined style={{ color: '#faad14' }} />
                  <span>Chờ Duyệt Đổi Lịch</span>
                </Space>
              }
              value={statistics.pendingApproval}
              suffix="yêu cầu"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false}>
            <Statistic
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>Cần Xử Lý Gấp</span>
                </Space>
              }
              value={statistics.urgent}
              suffix="lịch hẹn"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false}>
            <Statistic
              title={
                <Space>
                  <CheckSquareOutlined style={{ color: '#52c41a' }} />
                  <span>Tổng Cần Xử Lý</span>
                </Space>
              }
              value={statistics.total}
              suffix="lịch hẹn"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {}
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
