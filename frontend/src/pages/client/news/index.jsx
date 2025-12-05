import { CalendarOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Pagination, Row, Select, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { callFetchNews, callGetNewsCategories } from '@/services/news.service';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const ClientNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  });
  const [filter, setFilter] = useState({
    category: null,
    search: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [pagination.current, pagination.pageSize, filter]);

  const fetchCategories = async () => {
    try {
      const res = await callGetNewsCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      let query = `page=${pagination.current - 1}&size=${
        pagination.pageSize
      }&sort=publishedAt,desc&filter=isPublished:true`;

      if (filter.category) {
        query += ` and category:'${filter.category}'`;
      }

      if (filter.search) {
        query += ` and title~'*${filter.search}*'`;
      }

      const res = await callFetchNews(query);
      if (res?.data?.result) {
        setNews(res.data.result);
        setPagination({
          ...pagination,
          total: res.data.meta.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  const handleSearch = (value) => {
    setFilter({ ...filter, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleCategoryChange = (value) => {
    setFilter({ ...filter, category: value });
    setPagination({ ...pagination, current: 1 });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'VACCINE_INFO':
        return 'blue';
      case 'CHILDREN_HEALTH':
        return 'green';
      case 'DISEASE_PREVENTION':
        return 'orange';
      case 'HEALTH_GENERAL':
        return 'purple';
      case 'ANNOUNCEMENT':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatCategory = (category) => {
    return category ? category.replace(/_/g, ' ') : 'News';
  };

  return (
    <div className="flex flex-col ">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mb-8">
        <div className="container mx-auto px-4 text-center">
          <Title level={1} className="!text-white mb-4">
            Health News & Insights
          </Title>
          <Paragraph className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover the latest updates on vaccinations, public health guidelines, and medical
            breakthroughs.
          </Paragraph>
        </div>
      </div>

      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Search
                  placeholder="Search news..."
                  allowClear
                  enterButton={
                    <Button type="primary" icon={<SearchOutlined />}>
                      Search
                    </Button>
                  }
                  size="large"
                  onSearch={handleSearch}
                />
              </Col>
              <Col xs={24} md={12} className="flex justify-end gap-4">
                <span className="self-center text-gray-500">Filter by:</span>
                <Select
                  placeholder="All Categories"
                  style={{ width: 200 }}
                  size="large"
                  allowClear
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>

          {/* News Grid */}
          {loading ? (
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col xs={24} sm={12} lg={8} key={i}>
                  <Card cover={<Skeleton.Image active className="!w-full !h-48" />}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <>
              {news.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {news.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <Card
                        hoverable
                        className="h-full flex flex-col rounded-xl overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        cover={
                          <Link
                            to={`/news/${item.slug}`}
                            className="h-52 overflow-hidden relative group cursor-pointer block"
                          >
                            <img
                              alt={item.title}
                              src={item.thumbnailImage || 'https://placehold.co/600x400?text=News'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3">
                              <Tag
                                color={getCategoryColor(item.category)}
                                className="m-0 font-semibold border-0 shadow-sm"
                              >
                                {formatCategory(item.category)}
                              </Tag>
                            </div>
                          </Link>
                        }
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <CalendarOutlined /> {dayjs(item.publishedAt).format('MMM D, YYYY')}
                            </span>
                            <span className="flex items-center gap-1">
                              <EyeOutlined /> {item.viewCount || 0} views
                            </span>
                          </div>

                          <Title level={4} className="mb-3 line-clamp-2 min-h-[3.5rem]">
                            <Link
                              to={`/news/${item.slug}`}
                              className="text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {item.title}
                            </Link>
                          </Title>

                          <Paragraph className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                            {item.shortDescription}
                          </Paragraph>

                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Text type="secondary" className="text-xs">
                                By
                              </Text>
                              <Text strong className="text-xs">
                                {item.author || 'VaxSafe Team'}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                  <Title level={4} type="secondary">
                    No news found
                  </Title>
                  <Paragraph type="secondary">Try adjusting your search or filters</Paragraph>
                </div>
              )}

              {/* Pagination */}
              {news.length > 0 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClientNewsPage;
