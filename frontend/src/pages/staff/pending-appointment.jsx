/* eslint-disable no-unused-vars */
import { useRef, useState, useEffect } from 'react';
import queryString from 'query-string';
import { sfLike } from 'spring-filter-query-builder';
import {
  Badge,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Avatar,
} from 'antd';
import {
  EditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckSquareOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import DataTable from '../../components/data-table';
import AssignAppointmentModal from '../../components/modal/AssignAppointmentModal';
import { useDispatch, useSelector } from 'react-redux';
import { getColorStatus } from '../../utils/status';
import { fetchAppointmentOfCenter } from '../../redux/slice/appointmentSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const PendingAppointmentPage = () => {
  const tableRef = useRef();

  const isFetching = useSelector((state) => state.appointment.isFetching);
  const meta = useSelector((state) => state.appointment.meta);
  const appointments = useSelector((state) => state.appointment.result);
  const dispatch = useDispatch();
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
    pendingSchedule: appointments.filter(apt => apt.status === 'PENDING_SCHEDULE').length,
    pendingApproval: appointments.filter(apt => apt.status === 'PENDING_APPROVAL').length,
    urgent: appointments.filter(apt => {
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
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <Text strong>{text}</Text>
            {record.status === 'PENDING_APPROVAL' && (
              <Tag color="orange" style={{ fontSize: 10 }}>
                Đổi lịch
              </Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined /> {record.phone || 'N/A'}
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
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày Yêu Cầu',
      dataIndex: 'desiredDate',
      width: 180,
      render: (text, record) => {
        const dateToShow = text || record.scheduledDate;
        const timeToShow = record.desiredTime || record.scheduledTime;
        const isUrgent = dayjs(dateToShow).diff(dayjs(), 'day') <= 1;
        const isReschedule = record.status === 'PENDING_APPROVAL';
        
        return (
          <Space direction="vertical" size={0}>
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
            {timeToShow && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {timeToShow}
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
      width: 120,
      render: (text) => <Tag color={getColorStatus(text)}>{text}</Tag>,
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'rescheduleReason',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => {
        const displayText = text || record.notes;
        const isReschedule = record.status === 'PENDING_APPROVAL';
        
        return (
          <Tooltip placement="topLeft" title={displayText}>
            <Space direction="vertical" size={0}>
              {isReschedule && text && (
                <Text type="warning" strong style={{ fontSize: 12 }}>
                  Lý do đổi lịch:
                </Text>
              )}
              <Text>{displayText || '-'}</Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isPendingSchedule = record.status === 'PENDING_SCHEDULE';
        const isPendingApproval = record.status === 'PENDING_APPROVAL';
        const needsAction = isPendingSchedule || isPendingApproval;
        
        if (needsAction) {
          return (
            <Space direction="vertical" size="small">
              <Tooltip title={isPendingApproval ? 'Duyệt đổi lịch' : 'Phân công lịch hẹn'}>
                <Button
                  type={isPendingApproval ? 'default' : 'primary'}
                  icon={isPendingApproval ? <CheckSquareOutlined /> : <CalendarOutlined />}
                  onClick={() => handleAssignAppointment(record)}
                  style={isPendingApproval ? { 
                    background: '#fff7e6', 
                    borderColor: '#ffa940',
                    color: '#fa8c16'
                  } : {}}
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

  const buildQuery = (params, sort) => {
    const clone = { ...params };
    const q = {
      page: params.current,
      size: params.pageSize,
      filter: '',
    };

    // Add filters
    const filters = [];

    if (searchText) {
      filters.push(
        `(${sfLike('patientName', searchText)} or ${sfLike('id', searchText)})`
      );
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
            <Text type="secondary">
              Quản lý và phân công lịch hẹn chưa xếp lịch
            </Text>
          </div>
          <Badge
            count={statistics.pending}
            style={{ backgroundColor: '#faad14' }}
          />
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
              valueStyle={{ color: '#1890ff' }}
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
              valueStyle={{ color: '#faad14' }}
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
              valueStyle={{ color: '#ff4d4f' }}
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
              valueStyle={{ color: '#52c41a' }}
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
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
              >
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
            dispatch(fetchAppointmentOfCenter({ query }));
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

      {/* Assign Modal */}
      <AssignAppointmentModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        appointment={selectedAppointment}
        onSuccess={reloadTable}
      />
    </div>
  );
};

export default PendingAppointmentPage;
