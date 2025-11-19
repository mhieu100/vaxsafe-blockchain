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
  Modal,
  Form,
  TimePicker,
  Radio,
  message,
  Tooltip,
  Avatar,
  Divider,
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
import { useDispatch, useSelector } from 'react-redux';
import { getColorStatus } from '../../utils/status';
import { fetchAppointmentOfCenter } from '../../redux/slice/appointmentSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PendingAppointmentPage = () => {
  const tableRef = useRef();
  const [form] = Form.useForm();

  const isFetching = useSelector((state) => state.appointment.isFetching);
  const meta = useSelector((state) => state.appointment.meta);
  const appointments = useSelector((state) => state.appointment.result);
  const dispatch = useDispatch();
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [isRescheduleRequest, setIsRescheduleRequest] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('');

  // Mock data for doctors
  const doctors = [
    { id: 'BS001', name: 'BS. Nguyễn Văn Minh', specialty: 'Chuyên khoa Nhi' },
    { id: 'BS002', name: 'BS. Trần Thị Lan', specialty: 'Đa khoa' },
    { id: 'BS003', name: 'BS. Lê Hoàng Nam', specialty: 'Truyền nhiễm' },
    { id: 'BS004', name: 'BS. Phạm Thị Hà', specialty: 'Sản Phụ khoa' },
  ];

  // Mock time slots
  const mockTimeSlots = [
    { time: '08:00', available: true },
    { time: '08:30', available: false },
    { time: '09:00', available: true },
    { time: '09:30', available: false },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: false },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: false },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
  ];

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
    setIsRescheduleRequest(record.status === 'PENDING_APPROVAL');
    setOpenAssignModal(true);
    form.resetFields();
    setSelectedDoctor(record.doctorId || null);
    setSelectedTimeSlot(null);
    
    // If reschedule request, pre-fill the desired date
    if (record.status === 'PENDING_APPROVAL' && record.desiredDate) {
      const desiredDate = dayjs(record.desiredDate);
      setSelectedDate(desiredDate);
      form.setFieldsValue({
        appointmentDate: desiredDate,
        doctorId: record.doctorId,
      });
      
      // Load schedule for existing doctor
      if (record.doctorId) {
        loadDoctorSchedule(record.doctorId, desiredDate);
      }
    } else {
      setSelectedDate(dayjs());
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    loadDoctorSchedule(doctorId, selectedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      loadDoctorSchedule(selectedDoctor, date);
    }
  };

  const loadDoctorSchedule = (doctorId, date) => {
    // Mock loading schedule - replace with actual API call
    setDoctorSchedules(mockTimeSlots);
  };

  const handleConfirmAssign = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedTimeSlot) {
        message.warning('Vui lòng chọn khung giờ!');
        return;
      }

      // Mock API call - replace with actual API
      message.success('Phân công lịch hẹn thành công!');
      setOpenAssignModal(false);
      reloadTable();
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
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
      <Modal
        title={
          <Space>
            {isRescheduleRequest ? (
              <>
                <EditOutlined style={{ color: '#faad14' }} />
                <span>Duyệt Yêu Cầu Đổi Lịch</span>
                <Tag color="warning">PENDING_APPROVAL</Tag>
              </>
            ) : (
              <>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Phân Công Lịch Hẹn</span>
              </>
            )}
          </Space>
        }
        open={openAssignModal}
        onCancel={() => setOpenAssignModal(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setOpenAssignModal(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmAssign}
          >
            {isRescheduleRequest ? 'Xác Nhận Đổi Lịch' : 'Xác Nhận Phân Công'}
          </Button>,
        ]}
      >
        {selectedAppointment && (
          <>
            {/* Appointment Info */}
            <Card
              size="small"
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Thông Tin Lịch Hẹn</span>
                  {isRescheduleRequest && (
                    <Tag color="warning" icon={<EditOutlined />}>
                      Yêu cầu đổi lịch
                    </Tag>
                  )}
                </Space>
              }
              style={{ 
                marginBottom: 24,
                background: isRescheduleRequest ? '#fffbf0' : 'white'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Mã lịch hẹn:</Text>
                  <br />
                  <Text strong>#{selectedAppointment.id}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Bệnh nhân:</Text>
                  <br />
                  <Text strong>{selectedAppointment.patientName}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Số điện thoại:</Text>
                  <br />
                  <Text strong>{selectedAppointment.phone || 'N/A'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Vaccine:</Text>
                  <br />
                  <Tag color="blue">{selectedAppointment.vaccineName}</Tag>
                </Col>
                
                {/* Show old schedule if rescheduling */}
                {isRescheduleRequest && selectedAppointment.scheduledDate && (
                  <>
                    <Col span={24}>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text strong style={{ color: '#ff4d4f' }}>
                        Lịch Cũ (Đang muốn đổi):
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Ngày cũ:</Text>
                      <br />
                      <Text delete style={{ color: '#999' }}>
                        {dayjs(selectedAppointment.scheduledDate).format('DD/MM/YYYY')}
                        {selectedAppointment.scheduledTime && ` - ${selectedAppointment.scheduledTime}`}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Bác sĩ cũ:</Text>
                      <br />
                      <Text delete style={{ color: '#999' }}>
                        {selectedAppointment.doctorName || 'Chưa có'}
                      </Text>
                    </Col>
                  </>
                )}
                
                <Col span={24}>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong style={{ color: '#52c41a' }}>
                    {isRescheduleRequest ? 'Lịch Mới (Yêu cầu):' : 'Thông tin yêu cầu:'}
                  </Text>
                </Col>
                
                <Col span={12}>
                  <Text type="secondary">
                    {isRescheduleRequest ? 'Ngày mới mong muốn:' : 'Ngày mong muốn:'}
                  </Text>
                  <br />
                  <Text strong style={{ color: isRescheduleRequest ? '#52c41a' : '#ff4d4f' }}>
                    {dayjs(selectedAppointment.desiredDate || selectedAppointment.scheduledDate).format('DD/MM/YYYY')}
                    {selectedAppointment.desiredTime && ` - ${selectedAppointment.desiredTime}`}
                  </Text>
                </Col>
                
                <Col span={12}>
                  <Text type="secondary">
                    {isRescheduleRequest ? 'Thời gian yêu cầu:' : 'Trung tâm:'}
                  </Text>
                  <br />
                  {isRescheduleRequest ? (
                    <Text type="warning">
                      {dayjs(selectedAppointment.rescheduledAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  ) : (
                    <Text>{selectedAppointment.centerName}</Text>
                  )}
                </Col>
                
                {isRescheduleRequest && selectedAppointment.rescheduleReason && (
                  <Col span={24}>
                    <Text type="secondary">Lý do đổi lịch:</Text>
                    <br />
                    <Text strong style={{ color: '#fa8c16' }}>
                      {selectedAppointment.rescheduleReason}
                    </Text>
                  </Col>
                )}
                
                {!isRescheduleRequest && selectedAppointment.notes && (
                  <Col span={24}>
                    <Text type="secondary">Ghi chú:</Text>
                    <br />
                    <Text>{selectedAppointment.notes}</Text>
                  </Col>
                )}
              </Row>
            </Card>

            <Divider />

            {/* Assignment Form */}
            <Form form={form} layout="vertical">
              <Form.Item
                name="doctorId"
                label={<Text strong>Chọn Bác Sĩ</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
              >
                <Select
                  placeholder="-- Chọn bác sĩ --"
                  onChange={handleDoctorChange}
                  size="large"
                >
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      <Space>
                        <UserOutlined />
                        <span>{doctor.name}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          - {doctor.specialty}
                        </Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="appointmentDate"
                label={<Text strong>Chọn Ngày</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                initialValue={selectedDate}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  onChange={handleDateChange}
                  size="large"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                />
              </Form.Item>

              {selectedDoctor && doctorSchedules.length > 0 && (
                <Form.Item label={<Text strong>Chọn Khung Giờ</Text>}>
                  <div
                    style={{
                      maxHeight: 250,
                      overflowY: 'auto',
                      border: '1px solid #d9d9d9',
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <Radio.Group
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      value={selectedTimeSlot}
                      style={{ width: '100%' }}
                    >
                      <Space
                        direction="vertical"
                        style={{ width: '100%' }}
                        size="middle"
                      >
                        {doctorSchedules.map((slot, index) => (
                          <Radio
                            key={index}
                            value={slot.time}
                            disabled={!slot.available}
                            style={{
                              width: '100%',
                              padding: 12,
                              background: slot.available
                                ? '#f6ffed'
                                : '#fff2e8',
                              border: `1px solid ${
                                slot.available ? '#b7eb8f' : '#ffbb96'
                              }`,
                              borderRadius: 8,
                            }}
                          >
                            <Space
                              style={{
                                width: '100%',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Space>
                                <ClockCircleOutlined />
                                <Text strong>{slot.time}</Text>
                              </Space>
                              <Tag color={slot.available ? 'success' : 'error'}>
                                {slot.available ? 'Trống' : 'Đã đặt'}
                              </Tag>
                            </Space>
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                </Form.Item>
              )}

              <Form.Item
                name="notes"
                label={<Text strong>Ghi Chú Thêm (Tùy chọn)</Text>}
              >
                <TextArea rows={3} placeholder="Nhập ghi chú cho bác sĩ..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PendingAppointmentPage;
