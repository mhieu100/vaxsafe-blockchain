import { EditOutlined } from '@ant-design/icons';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';

import DataTable from '@/components/data-table';
import { callFetchPermission } from '@/services/permission.service';
import { useRoleStore } from '@/stores/useRoleStore';
import { groupByPermission } from '@/utils/permission';
import ModalRole from './components/RoleModal';

const RolePage = () => {
  const tableRef = useRef();

  const isFetching = useRoleStore((state) => state.isFetching);
  const meta = useRoleStore((state) => state.meta);
  const roles = useRoleStore((state) => state.result);
  const fetchRole = useRoleStore((state) => state.fetchRole);

  const [openModal, setOpenModal] = useState(false);
  const [listPermissions, setListPermissions] = useState();
  const [singleRole, setSingleRole] = useState();
  useEffect(() => {
    const init = async () => {
      const res = await callFetchPermission('page=1&size=100');
      if (res.data?.result) {
        setListPermissions(groupByPermission(res.data?.result));
      }
    };
    init();
  }, []);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_text, _record, index) => {
        return <>{index + 1 + (meta.page - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
    },

    {
      title: 'Actions',
      hideInSearch: true,
      width: 50,
      render: (_value, entity) => (
        <EditOutlined
          style={{
            fontSize: 20,
            color: '#ffa500',
          }}
          onClick={() => {
            setSingleRole(entity);
            setOpenModal(true);
          }}
        />
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
    if (clone.name) {
      filters.push(sfLike('name', clone.name));
    }

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    if (sort?.name) {
      q.sort = `name,${sort.name === 'ascend' ? 'asc' : 'desc'}`;
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
        headerTitle="List Role"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={roles}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          fetchRole(query);
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
                {range[0]}-{range[1]} trên {total} rows
              </div>
            );
          },
        }}
        rowSelection={false}
      />
      <ModalRole
        openModal={openModal}
        setOpenModal={setOpenModal}
        listPermissions={listPermissions}
        singleRole={singleRole}
        setSingleRole={setSingleRole}
        reloadTable={() => tableRef?.current?.reload()}
      />
    </>
  );
};
export default RolePage;
