import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, notification, Popconfirm, Space, Switch, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import DataTable from '@/components/data-table';
import { callDeleteNews, callPublishNews, callUnpublishNews } from '@/services/news.service';
import { useNewsStore } from '@/stores/useNewsStore';
import ModalNews from './components/NewsModal';

const NewsPage = () => {
  const tableRef = useRef();
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const [dataInit, setDataInit] = useState([]);

  const isFetching = useNewsStore((state) => state.isFetching);
  const meta = useNewsStore((state) => state.meta);
  const news = useNewsStore((state) => state.result);
  const fetchNews = useNewsStore((state) => state.fetchNews);

  const [openModal, setOpenModal] = useState(false);

  const handleDeleteNews = async (id) => {
    if (id) {
      const res = await callDeleteNews(id);
      if (res && (res.statusCode === 200 || res.statusCode === 204)) {
        message.success('Xóa tin tức thành công');
        reloadTable();
      } else {
        notification.error({
          message: 'Đã xảy ra lỗi',
          description: res.message,
        });
      }
    }
  };

  const handleTogglePublish = async (record) => {
    try {
      if (record.isPublished) {
        const res = await callUnpublishNews(record.id);
        if (res?.data) {
          message.success('Chuyển tin tức thành nháp');
          reloadTable();
        }
      } else {
        const res = await callPublishNews(record.id);
        if (res?.data) {
          message.success('Xuất bản tin tức thành công');
          reloadTable();
        }
      }
    } catch (error) {
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: error.message,
      });
    }
  };

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
      title: 'Hình ảnh',
      dataIndex: 'thumbnailImage',
      width: 80,
      hideInSearch: true,
      render: (text) => (
        <img
          src={text || '/placeholder-news.png'}
          alt="news"
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      sorter: true,
      width: 250,
      render: (text) => (
        <Tooltip title={text}>{text?.length > 50 ? `${text.slice(0, 50)}...` : text}</Tooltip>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      width: 150,
      render: (category) => {
        const colors = {
          VACCINE_INFO: 'blue',
          CHILDREN_HEALTH: 'green',
          COVID_19: 'red',
          HEALTH_GENERAL: 'purple',
          NUTRITION: 'orange',
          SEASONAL_DISEASES: 'cyan',
          VACCINATION_SCHEDULE: 'geekblue',
        };
        return <Tag color={colors[category] || 'default'}>{category?.replace(/_/g, ' ')}</Tag>;
      },
      renderFormItem: (_item, { type, defaultRender, ...rest }, _form) => {
        return (
          <select {...rest} style={{ width: '100%', padding: '4px 11px', borderRadius: 6 }}>
            <option value="">Tất cả</option>
            <option value="VACCINE_INFO">Vaccine Info</option>
            <option value="CHILDREN_HEALTH">Children Health</option>
            <option value="COVID_19">Covid-19</option>
            <option value="HEALTH_GENERAL">Health General</option>
            <option value="NUTRITION">Nutrition</option>
            <option value="SEASONAL_DISEASES">Seasonal Diseases</option>
            <option value="VACCINATION_SCHEDULE">Vaccination Schedule</option>
          </select>
        );
      },
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>{text?.length > 20 ? `${text.slice(0, 20)}...` : text}</Tooltip>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      width: 80,
      align: 'center',
      sorter: true,
      hideInSearch: true,
      render: (count) => (
        <Space>
          <EyeOutlined />
          {count || 0}
        </Space>
      ),
    },
    {
      title: 'Nổi bật',
      dataIndex: 'isFeatured',
      width: 80,
      align: 'center',
      hideInSearch: true,
      render: (isFeatured) => (
        <Tag color={isFeatured ? 'gold' : 'default'}>{isFeatured ? 'Có' : 'Không'}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      width: 120,
      align: 'center',
      hideInSearch: true,
      render: (isPublished, record) => (
        <Switch
          checked={isPublished}
          checkedChildren="Công khai"
          unCheckedChildren="Nháp"
          onChange={() => handleTogglePublish(record)}
        />
      ),
    },
    {
      title: 'Ngày xuất bản',
      dataIndex: 'publishedAt',
      width: 150,
      sorter: true,
      hideInSearch: true,
      render: (publishedAt) => (publishedAt ? dayjs(publishedAt).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Hành động',
      width: 120,
      align: 'center',
      hideInSearch: true,
      render: (_text, record) => {
        return (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={{
                  fontSize: 20,
                  color: '#ffa500',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setOpenModal(true);
                  setDataInit(record);
                }}
              />
            </Tooltip>
            <Popconfirm
              placement="leftTop"
              title={'Xác nhận xóa tin tức'}
              description={'Bạn có chắc chắn muốn xóa tin tức này?'}
              onConfirm={() => handleDeleteNews(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <DeleteOutlined style={{ fontSize: 20, color: 'red', cursor: 'pointer' }} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const buildQuery = (params, sort, _filter) => {
    const clone = { ...params };
    const q = {
      page: clone.current, // Backend configured for one-indexed pages
      size: clone.pageSize,
    };

    // Build filter
    const filters = [];
    if (clone.title) {
      filters.push(sfLike('title', clone.title));
    }
    if (clone.category) {
      filters.push(`category:'${clone.category}'`);
    }
    if (clone.author) {
      filters.push(sfLike('author', clone.author));
    }

    if (filters.length > 0) {
      q.filter = filters.join(' and ');
    }

    // Build sort
    if (sort?.title) {
      q.sort = `title,${sort.title === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort?.viewCount) {
      q.sort = `viewCount,${sort.viewCount === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (sort?.publishedAt) {
      q.sort = `publishedAt,${sort.publishedAt === 'ascend' ? 'asc' : 'desc'}`;
    }
    if (!q.sort) {
      q.sort = 'updatedAt,desc';
    }

    return queryString.stringify(q);
  };

  const handleSearch = (params, sort, filter) => {
    const query = buildQuery(params, sort, filter);
    fetchNews(query);
  };

  return (
    <div>
      <DataTable
        actionRef={tableRef}
        headerTitle="Quản lý Tin tức"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={news}
        request={handleSearch}
        scroll={{ x: true }}
        pagination={{
          current: meta.page,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {range[0]}-{range[1]} trên {total} hàng
              </div>
            );
          },
        }}
        rowClassName={(_record, index) => (index % 2 === 0 ? 'table-row-even' : 'table-row-odd')}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenModal(true);
            }}
            type="primary"
          >
            Thêm mới
          </Button>,
        ]}
      />
      <ModalNews
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default NewsPage;
