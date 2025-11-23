import { useRef, useState } from 'react';
import queryString from 'query-string';
import { sfLike } from 'spring-filter-query-builder';
import { Button, message, notification, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import { useCenterStore } from '../../stores/useCenterStore';
import DataTable from '../../components/data-table';
import ModalCenter from '../../components/modal/modal.center';
import { callDeleteCenter } from '../../config/api.center';

const CenterPage = () => {
  const tableRef = useRef();

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const [dataInit, setDataInit] = useState(null);

  const isFetching = useCenterStore((state) => state.isFetching);
  const meta = useCenterStore((state) => state.meta);
  const centers = useCenterStore((state) => state.result);
  const fetchCenter = useCenterStore((state) => state.fetchCenter);
  const [openModal, setOpenModal] = useState(false);

  const handleDeleteCompany = async (id) => {
    if (id) {
      const res = await callDeleteCenter(id);
      message.success('Xóa cơ sở tiêm chủng thành công');
      reloadTable();
      if (res) {
        notification.error({
          message: 'Đã xảy ra lỗi',
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
      render: (text, record, index) => {
        return <>{index + 1 + (meta.page - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      hideInSearch: true,
      render: (text) => (
        <img
          src={text}
          alt="center"
          style={{
            width: '50px',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      ),
    },
    {
      title: 'Tên cơ sở',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      sorter: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      hideInSearch: true,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: 'Giờ làm việc',
      hideInSearch: true,
      dataIndex: 'workingHours',
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
            title="Xác nhận xóa cơ sở"
            description="Bạn có chắc chắn muốn xóa cơ sở tiêm chủng này?"
            onConfirm={() => handleDeleteCompany(entity.centerId)}
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
    if (clone.name) {
      filters.push(sfLike('name', clone.name));
    }
    if (clone.address) {
      filters.push(sfLike('address', clone.address));
    }

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    // Build sort
    if (sort && sort.name) {
      q.sort = `name,${sort.name === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort && sort.address) {
      q.sort = `address,${sort.address === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort && sort.capacity) {
      q.sort = `capacity,${sort.capacity === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (!q.sort) {
      q.sort = 'name,asc';
    }

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Danh sách cơ sở tiêm chủng"
        rowKey="centerId"
        loading={isFetching}
        columns={columns}
        dataSource={centers}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          fetchCenter(query);
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
        toolBarRender={() => {
          return (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setOpenModal(true)}
            >
              Thêm mới
            </Button>
          );
        }}
      />
      <ModalCenter
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </>
  );
};
export default CenterPage;
