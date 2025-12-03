import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { message, notification, Popconfirm, Space } from 'antd';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { callDeleteUser, callFetchDoctors } from '@/services/user.service';
import ModalUser from '../user/components/UserModal';

const DoctorPage = () => {
  const tableRef = useRef();
  const [dataInit, setDataInit] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const fetchDoctors = async (query) => {
    setLoading(true);
    try {
      const res = await callFetchDoctors(query);
      if (res?.data) {
        setUsers(res.data.result || []);
        setMeta(res.data.meta || meta);
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách bác sĩ',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id) {
      const res = await callDeleteUser(id);
      if (res && (res.statusCode === 200 || res.statusCode === 204)) {
        message.success('Xóa bác sĩ thành công');
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
      dataIndex: 'phone',
      hideInSearch: true,
    },
    {
      title: 'Chuyên khoa',
      dataIndex: ['doctorProfile', 'specialty'],
      hideInSearch: true,
    },
    {
      title: 'Cơ sở',
      dataIndex: ['center', 'name'],
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      hideInSearch: true,
      width: 50,
      render: (_value, entity) => (
        <Space>
          <EditOutlined
            style={{
              fontSize: 20,
              color: '#ffa500',
            }}
            onClick={() => {
              setOpenModal(true);
              setDataInit(entity);
            }}
          />

          <Popconfirm
            placement="leftTop"
            title="Xác nhận xóa bác sĩ"
            description="Bạn có chắc chắn muốn xóa bác sĩ này?"
            onConfirm={() => handleDeleteUser(entity.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <span style={{ cursor: 'pointer', margin: '0 10px' }}>
              <DeleteOutlined
                style={{
                  fontSize: 20,
                  color: '#ff4d4f',
                }}
              />
            </span>
          </Popconfirm>
        </Space>
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

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    if (sort?.fullName) {
      q.sort = `fullName,${sort.fullName === 'ascend' ? 'asc' : 'desc'}`;
    } else if (sort?.email) {
      q.sort = `email,${sort.email === 'ascend' ? 'asc' : 'desc'}`;
    } else {
      q.sort = 'fullName,asc';
    }

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Danh sách bác sĩ"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          await fetchDoctors(query);
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
      <ModalUser
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </>
  );
};

export default DoctorPage;
