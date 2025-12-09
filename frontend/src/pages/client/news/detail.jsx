import {
  ArrowRightOutlined,
  CalendarOutlined,
  ShareAltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Col, message, Row, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { callFetchNewsBySlug, callFetchPublishedNews } from '@/services/news.service';

const { Title, Text } = Typography;

const ClientNewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingNews, setTrendingNews] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const res = await callFetchNewsBySlug(slug);
      if (res?.data) {
        setNews(res.data);
        fetchTrendingNews(res.data.id);
      } else {
        message.error('News article not found');
        navigate('/news');
      }
    } catch (error) {
      console.error('Failed to fetch news detail:', error);
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingNews = async (currentId) => {
    try {
      const res = await callFetchPublishedNews();
      if (res?.data) {
        const trending = res.data
          .filter((item) => item.id !== currentId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        setTrendingNews(trending);
      }
    } catch (error) {
      console.error('Failed to fetch trending news:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Link copied to clipboard!');
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <section className="bg-blue-50 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {}
            <div className="border-b border-gray-100 py-4">
              <Skeleton.Input active size="small" style={{ width: 200 }} />
            </div>

            <div className="container mx-auto px-4 py-8">
              <Row gutter={[48, 32]}>
                {}
                <Col xs={24} lg={16}>
                  {}
                  <div className="mb-6">
                    <Skeleton
                      active
                      paragraph={{ rows: 1 }}
                      title={{
                        width: '90%',
                        style: { height: 40, marginBottom: 16 },
                      }}
                    />

                    {}
                    <div className="flex gap-4 mt-4">
                      <Skeleton.Button active size="small" shape="round" style={{ width: 100 }} />
                      <Skeleton.Button active size="small" shape="round" style={{ width: 120 }} />
                      <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
                    </div>
                  </div>

                  {}
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
                    <Skeleton.Image active className="!w-full !h-full" />
                  </div>

                  {}
                  <Skeleton active paragraph={{ rows: 12 }} />
                </Col>

                {}
                <Col xs={24} lg={8}>
                  <div className="space-y-8">
                    {}
                    <div className="rounded-xl overflow-hidden">
                      <Skeleton.Button active block style={{ height: 300 }} />
                    </div>

                    {}
                    <div>
                      <Skeleton
                        active
                        paragraph={{ rows: 0 }}
                        title={{ width: 150, style: { marginBottom: 16 } }}
                      />
                      <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton.Image active style={{ width: 96, height: 80 }} />
                            <div className="flex-1">
                              <Skeleton active paragraph={{ rows: 2 }} title={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="flex flex-col ">
      <section className="bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {}
          <div className="border-b border-gray-100">
            <div className="container mx-auto px-4 py-4">
              <Breadcrumb
                items={[
                  {
                    title: <Link to="/">Home</Link>,
                  },
                  {
                    title: <Link to="/news">News</Link>,
                  },
                  { title: news.title },
                ]}
              />
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <Row gutter={[48, 32]}>
              {}
              <Col xs={24} lg={16}>
                <article>
                  {}
                  <div className="mb-6">
                    <Title
                      level={1}
                      className="!text-3xl md:!text-4xl !font-bold !mb-4 text-gray-900"
                    >
                      {news.title}
                    </Title>

                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <CalendarOutlined />
                        <span>{dayjs(news.publishedAt).format('MMM D, YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserOutlined />
                        <span className="font-medium text-gray-700">
                          {news.author || 'VaxSafe Editor'}
                        </span>
                      </div>
                      <Tag
                        color={getCategoryColor(news.category)}
                        className="rounded-full px-3 border-0"
                      >
                        {formatCategory(news.category)}
                      </Tag>
                    </div>
                  </div>

                  {}
                  {news.coverImage && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
                      <img
                        src={news.coverImage}
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {}
                  <div className="prose prose-lg max-w-none text-gray-800">
                    {news.shortDescription && (
                      <p className="lead text-xl text-gray-600 font-medium mb-8">
                        {news.shortDescription}
                      </p>
                    )}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(news.content),
                      }}
                    />
                  </div>

                  {}
                  <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-2">
                      {news.tags?.split(',').map((tag) => (
                        <Tag
                          key={tag}
                          className="bg-gray-100 text-gray-600 border-0 rounded-md px-3 py-1 text-sm"
                        >
                          #{tag.trim()}
                        </Tag>
                      ))}
                    </div>
                    <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                      Share Article
                    </Button>
                  </div>
                </article>
              </Col>

              {}
              <Col xs={24} lg={8}>
                <div className="sticky top-24 space-y-8">
                  {}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-2">
                      Every Shot. <br />
                      Every Record.
                    </h3>
                    <p className="text-emerald-100 text-sm mb-4">Investigated 10x Faster.</p>
                    <Button className="bg-emerald-400 text-teal-900 border-0 font-bold rounded-full px-6 hover:!bg-emerald-300">
                      Book a demo <ArrowRightOutlined />
                    </Button>
                  </div>

                  {}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900 m-0">Trending News</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {trendingNews.map((item) => (
                        <Link
                          key={item.id}
                          to={`/news/${item.slug}`}
                          className="flex gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors block"
                        >
                          <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={item.thumbnailImage || 'https://placehold.co/100x100?text=News'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-blue-600">
                              {item.title}
                            </h4>
                            <Text type="secondary" className="text-xs">
                              {dayjs(item.publishedAt).format('MMM D, YYYY')}
                            </Text>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientNewsDetailPage;
