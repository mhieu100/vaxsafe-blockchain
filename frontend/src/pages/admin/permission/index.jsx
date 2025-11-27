import { blue, green, orange, red } from '@ant-design/colors';
import { DeleteOutlined, EditOutlined, MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, message, notification, Popconfirm, Space } from 'antd';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { ViewPermission as ViewDetailPermission } from '@/components/modal/admin';
import { callDeletePermission } from '@/services/permission.service';
import { usePermissionStore } from '@/stores/usePermissionStore';
import ModalPermission from './components/PermissionModal';

const PermissionPage = () => {
  const tableRef = useRef();
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const [dataInit, setDataInit] = useState(null);

  const isFetching = usePermissionStore((state) => state.isFetching);
  const meta = usePermissionStore((state) => state.meta);
  const permissions = usePermissionStore((state) => state.result);
  const fetchPermission = usePermissionStore((state) => state.fetchPermission);

  const [openModal, setOpenModal] = useState(false);
  const [openViewDetail, setOpenViewDetail] = useState(false);

  const handleDeletePermission = async (id) => {
    if (id) {
      const res = await callDeletePermission(id);
      if (res && (res.statusCode === 200 || res.statusCode === 204)) {
        message.success('Permission deleted successfully');
        reloadTable();
      } else {
        notification.error({
          message: 'An error occurred',
          description: res.message,
        });
      }
    }
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_text, _record, index) => {
        return <>{index + 1 + (meta.page - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: 'API',
      dataIndex: 'apiPath',
      sorter: true,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      render: (_value, entity) => {
        let color;
        switch (entity.method) {
          case 'PUT':
            color = orange[6];
            break;
          case 'GET':
            color = blue[6];
            break;
          case 'DELETE':
            color = red[6];
            break;
          default:
            color = green[6];
        }
        return <Badge count={entity.method} showZero color={color} />;
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: 'Module',
      dataIndex: 'module',
    },
    {
      title: 'Actions',
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
          <MenuUnfoldOutlined
            style={{
              fontSize: 20,
              color: '#1890ff',
            }}
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(entity);
            }}
          />

          <Popconfirm
            placement="leftTop"
            title="Confirm delete this permission?"
            description="Are you sure you want to delete this permission?"
            onConfirm={() => handleDeletePermission(entity.id)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <span style={{ cursor: 'pointer', margin: '0' }}>
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
    if (clone.apiPath) {
      filters.push(sfLike('apiPath', clone.apiPath));
    }
    if (clone.module) {
      filters.push(sfLike('module', clone.module));
    }
    if (clone.method) {
      filters.push(sfLike('method', clone.method));
    }

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    // Build sort
    if (sort?.apiPath) {
      q.sort = `apiPath,${sort.apiPath === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (!q.sort) {
      q.sort = 'apiPath,asc';
    }

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Permission List"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={permissions}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          fetchPermission(query);
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
                {range[0]}-{range[1]} of {total} rows
              </div>
            );
          },
        }}
        rowSelection={false}
        toolBarRender={() => {
          return (
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpenModal(true)}>
              Add new
            </Button>
          );
        }}
      />
      <ModalPermission
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
      <ViewDetailPermission
        onClose={setOpenViewDetail}
        open={openViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </>
  );
};
export default PermissionPage;
