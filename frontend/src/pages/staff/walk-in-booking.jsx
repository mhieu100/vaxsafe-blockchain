import { CalendarOutlined } from '@ant-design/icons';
import { notification, Tooltip } from 'antd';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { callFetchPatients } from '@/services/user.service';
import WalkInBookingModal from './walk-in-booking/components/WalkInBookingModal';

const WalkInBookingPage = () => {
  const tableRef = useRef();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });

  const _reloadTable = () => {
    tableRef?.current?.reload();
  };

  const fetchPatients = async (query) => {
    setLoading(true);
    try {
      const res = await callFetchPatients(query);
      if (res?.data) {
        setPatients(res.data.result || []);
        setMeta(res.data.meta || meta);
      }
    } catch (_error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách lịch hẹn',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = (patient) => {
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      hideInSearch: true,
      render: (_text, _record, index) => {
        return <>{index + 1 + (meta.page - 1) * meta.pageSize}</>;
      },
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Điện thoại',
      dataIndex: ['patientProfile', 'phone'],
      hideInSearch: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['patientProfile', 'address'],
      sorter: true,
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['patientProfile', 'birthday'],
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      hideInSearch: true,
      width: 150,
      align: 'center',
      render: (_value, entity) => (
        <Tooltip title="Đặt lịch tiêm chủng">
          <CalendarOutlined
            style={{
              fontSize: 20,
              color: '#1890ff',
              cursor: 'pointer',
            }}
            onClick={() => handleCreateBooking(entity)}
          />
        </Tooltip>
      ),
    },
  ];

  const buildQuery = (params, sort) => {
    const clone = { ...params };
    const q = {
      page: clone.current,
      size: clone.pageSize,
    };

    const filters = [];
    if (clone.fullName) {
      filters.push(sfLike('fullName', clone.fullName));
    }
    if (clone.email) {
      filters.push(sfLike('email', clone.email));
    }
    if (clone.address) {
      filters.push(sfLike('patientProfile.address', clone.address));
    }

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    if (sort?.fullName) {
      q.sort = `fullName,${sort.fullName === 'ascend' ? 'asc' : 'desc'}`;
    } else if (sort?.email) {
      q.sort = `email,${sort.email === 'ascend' ? 'asc' : 'desc'}`;
    } else if (sort?.address) {
      q.sort = `patientProfile.address,${sort.address === 'ascend' ? 'asc' : 'desc'}`;
    } else {
      q.sort = 'fullName,asc';
    }

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Đặt lịch Walk-in - Chọn bệnh nhân"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={patients}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          await fetchPatients(query);
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
      <WalkInBookingModal
        open={openModal}
        setOpen={setOpenModal}
        patient={selectedPatient}
        onSuccess={() => {
          setOpenModal(false);
          setSelectedPatient(null);
        }}
      />
    </>
  );
};

export default WalkInBookingPage;
