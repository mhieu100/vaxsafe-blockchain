import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Badge, Button, message, notification, Space, Tag } from 'antd';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import {
  AppointmentStatus,
  getAppointmentStatusColor,
  getAppointmentStatusDisplay,
} from '@/constants/enums';
import { callCancelAppointment } from '../../services/appointment.service';
import { useAppointmentStore } from '../../stores/useAppointmentStore';
import { formatAppointmentTime } from '../../utils/appointment';
import CompletionModal from './dashboard/components/CompletionModal';

const MySchedulePage = () => {
  const tableRef = useRef();

  const isFetching = useAppointmentStore((state) => state.isFetching);
  const meta = useAppointmentStore((state) => state.meta);
  const appointments = useAppointmentStore((state) => state.result);
  const fetchAppointmentOfDoctor = useAppointmentStore((state) => state.fetchAppointmentOfDoctor);

  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const handleComplete = (record) => {
    setSelectedAppointment({
      id: record.id,
      patient: record.patientName,
      patientId: record.patientId,
      vaccine: record.vaccineName,
    });
    setCompletionModalOpen(true);
  };

  const handleCancel = async (id) => {
    if (id) {
      const res = await callCancelAppointment(id);
      if (res) {
        message.success('Hủy lịch hẹn thành công');
        reloadTable();
      } else {
        notification.error({
          message: res.error,
          description: res.message,
        });
      }
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_text, _record, index) => index + 1,
      hideInSearch: true,
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'scheduledDate',
    },
    {
      title: 'Giờ tiêm',
      dataIndex: 'scheduledTime',
      render: (_, record) => formatAppointmentTime(record),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName',
      render: (text) => {
        return text ? <Badge color="green" text={text} /> : <Badge color="red" text="Cập nhật" />;
      },
    },
    {
      title: 'Thu Ngân',
      dataIndex: 'cashierName',
      render: (text) => {
        return text ? <Badge color="green" text={text} /> : <Badge color="red" text="Cập nhật" />;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        return (
          <Tag color={getAppointmentStatusColor(status)}>{getAppointmentStatusDisplay(status)}</Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      render: (_value, entity) =>
        entity.status === AppointmentStatus.SCHEDULED ? (
          <Space>
            <Button type="primary" onClick={() => handleComplete(entity)}>
              <CheckOutlined />
              Xác nhận
            </Button>
            <Button type="error" onClick={() => handleCancel(entity.id)}>
              <CloseOutlined />
              Hủy lịch hẹn
            </Button>
          </Space>
        ) : null,
    },
  ];

  const buildQuery = (params, sort) => {
    const clone = { ...params };
    const q = {
      page: params.current,
      size: params.pageSize,
      filter: '',
    };

    if (clone.name) q.filter = `${sfLike('name', clone.name)}`;
    if (clone.manufacturer) {
      q.filter = clone.name
        ? `${q.filter} and ${sfLike('manufacturer', clone.manufacturer)}`
        : `${sfLike('manufacturer', clone.manufacturer)}`;
    }

    if (!q.filter) delete q.filter;

    let temp = queryString.stringify(q);

    let sortBy = '';
    if (sort?.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name,asc' : 'sort=name,desc';
    }
    if (sort?.manufacturer) {
      sortBy = sort.manufacturer === 'ascend' ? 'sort=manufacturer,asc' : 'sort=manufacturer,desc';
    }

    if (sort?.price) {
      sortBy = sort.price === 'ascend' ? 'sort=price,asc' : 'sort=price,desc';
    }
    if (sort?.stockQuantity) {
      sortBy =
        sort.stockQuantity === 'ascend' ? 'sort=stockQuantity,asc' : 'sort=stockQuantity,desc';
    }
    temp = `${temp}&${sortBy}`;

    return temp;
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Danh sách lịch hẹn hôm nay"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={appointments}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          fetchAppointmentOfDoctor(query);
        }}
        scroll={{ x: true }}
        pagination={{
          current: meta.page,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {range[0]}-{range[1]} trên tổng số {total} dòng
              </div>
            );
          },
        }}
        rowSelection={false}
      />
      <CompletionModal
        open={completionModalOpen}
        onCancel={() => setCompletionModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={() => {
          reloadTable();
        }}
      />
    </>
  );
};

export default MySchedulePage;
