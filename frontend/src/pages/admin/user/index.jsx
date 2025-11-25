import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Badge, message, notification, Popconfirm, Space } from 'antd';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { callDeleteUser } from '@/config/api.user';
import { useUserStore } from '@/stores/useUserStore';
import ModalUser from './components/UserModal';

const UserPage = () => {
  const tableRef = useRef();
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const [dataInit, setDataInit] = useState(null);

  const isFetching = useUserStore((state) => state.isFetching);
  const meta = useUserStore((state) => state.meta);
  const users = useUserStore((state) => state.result);
  const fetchUser = useUserStore((state) => state.fetchUser);

  const [openModal, setOpenModal] = useState(false);

  const handleDeleteUser = async (id) => {
    if (id) {
      const res = await callDeleteUser(id);
      if (res && (res.statusCode === 200 || res.statusCode === 204)) {
        message.success('Xóa người dùng thành công');
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
      title: 'Ví',
      dataIndex: 'walletAddress',
      hideInSearch: true,
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
      title: 'Cơ sở',
      dataIndex: ['center', 'name'],
      hideInSearch: true,
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'name'],
      hideInSearch: true,
      render: (_value, entity) => {
        const roleName = entity?.role?.name || '';
        let color;
        switch (roleName) {
          case 'ADMIN':
            color = '#faad14';
            break;
          case 'DOCTOR':
            color = '#52c41a';
            break;
          case 'CASHIER':
            color = '#1890ff';
            break;
          default:
            color = '#d9d9d9';
        }
        return <Badge count={roleName} showZero color={color} />;
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['patientProfile', 'birthday'],
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
            title="Xác nhận xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
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
      page: clone.current, // Backend configured for one-indexed pages
      size: clone.pageSize,
    };

    // Build filter
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

    // Build sort
    if (sort?.fullName) {
      q.sort = `fullName,${sort.fullName === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort?.email) {
      q.sort = `email,${sort.email === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort?.address) {
      q.sort = `patientProfile.address,${sort.address === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (!q.sort) {
      q.sort = 'fullName,asc';
    }

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Danh sách người dùng"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={users}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          fetchUser(query);
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

export default UserPage;
