import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  message,
  notification,
  Popconfirm,
  Space,
  Tooltip,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { sfLike } from 'spring-filter-query-builder';
import queryString from 'query-string';

import { callDeleteVaccine } from '../../config/api.vaccine';
import DataTable from '../../components/data-table';
import { fetchVaccine } from '../../redux/slice/vaccineSlice';
import ModalVaccine from '../../components/modal/modal.vaccine';

const VaccinePage = () => {
  const tableRef = useRef();
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const [dataInit, setDataInit] = useState([]);

  const isFetching = useSelector((state) => state.vaccine.isFetching);
  const meta = useSelector((state) => state.vaccine.meta);
  const vaccines = useSelector((state) => state.vaccine.result);
  const dispatch = useDispatch();


  const [openModal, setOpenModal] = useState(false);

  const handleDeleteVaccine = async (id) => {
    if (id) {
      const res = await callDeleteVaccine(id);
      if (res && (res.statusCode === 200 || res.statusCode === 204)) {
        message.success('Xóa vaccine thành công');
        reloadTable();
      } else {
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
      width: 80,
      hideInSearch: true,
      render: (text) => (
        <img 
          src={text || '/placeholder-vaccine.png'} 
          alt="vaccine" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      sorter: true,
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          {text?.length > 20 ? text.slice(0, 20) + '...' : text}
        </Tooltip>
      ),
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      sorter: true,
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          {text?.length > 20 ? text.slice(0, 20) + '...' : text}
        </Tooltip>
      ),
    },
    {
      title: 'Quốc gia',
      dataIndex: 'country',
      width: 100,
      hideInSearch: true,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      width: 120,
      hideInSearch: true,
      sorter: true,
      render: (value) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value);
      }
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      width: 80,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: 'Số liều cần thiết',
      dataIndex: 'dosesRequired',
      width: 100,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: 'Thời hạn (ngày)',
      dataIndex: 'duration',
      width: 100,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: 'Mô tả ngắn',
      dataIndex: 'descriptionShort',
      width: 200,
      hideInSearch: true,
      render: (text) => (
        <Tooltip title={text}>
          {text?.length > 50 ? text.slice(0, 50) + '...' : text}
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      hideInSearch: true,
      width: 100,
      fixed: 'right',
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
            placement='leftTop'
            title='Xóa Vaccine'
            description='Bạn có chắc chắn muốn xóa vaccine này?'
            onConfirm={() => handleDeleteVaccine(entity.id)}
            okText='Xác nhận'
            cancelText='Hủy'
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
      page: params.current,
      size: params.pageSize,
      filter: '',
    };

    if (clone.name)
      q.filter = `${sfLike('name', clone.name)}`;
    if (clone.manufacturer) {
      q.filter = clone.name
        ? q.filter + ' and ' + `${sfLike('manufacturer', clone.manufacturer)}`
        : `${sfLike('manufacturer', clone.manufacturer)}`;
    }

    if (!q.filter) delete q.filter;

    let temp = queryString.stringify(q);

    let sortBy = '';
    if (sort && sort.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name,asc' : 'sort=name,desc';
    }
    if (sort && sort.manufacturer) {
      sortBy = sort.manufacturer === 'ascend' ? 'sort=manufacturer,asc' : 'sort=manufacturer,desc';
    }
    if (sort && sort.price) {
      sortBy = sort.price === 'ascend' ? 'sort=price,asc' : 'sort=price,desc';
    }
    
    if (sortBy) {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle='Danh sách Vaccine'
        rowKey='id'
        loading={isFetching}
        columns={columns}
        dataSource={vaccines}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchVaccine({ query }));
        }}
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
        toolBarRender={() => [
          <Button
            key='button'
            type='primary'
            onClick={() => {
              setOpenModal(true);
              setDataInit(null);
            }}
          >
            <PlusOutlined /> Thêm Vaccine
          </Button>,
        ]}
      />

      <ModalVaccine
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </>
  );
};

export default VaccinePage;