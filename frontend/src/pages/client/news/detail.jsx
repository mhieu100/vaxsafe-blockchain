import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EyeOutlined,
  ShareAltOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { callFetchNewsBySlug, callFetchPublishedNews } from '@/services/news.service';

const { Title, Paragraph, Text } = Typography;

const ClientNewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

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
        fetchRelatedNews(res.data.category, res.data.id);
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

  const fetchRelatedNews = async (category, currentId) => {
    try {
      // For simplicity, just fetch published news and filter client-side or use category filter if API supports
      // Ideally: callFetchNews(`filter=category:'${category}' and id!=${currentId}&size=3`)
      const res = await callFetchPublishedNews();
      if (res?.data) {
        const related = res.data
          .filter((item) => item.id !== currentId && item.category === category)
          .slice(0, 3);
        setRelatedNews(related);
      }
    } catch (error) {
      console.error('Failed to fetch related news:', error);
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
      <div className="container mx-auto px-4 py-12">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb & Back */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Row justify="space-between" align="middle">
            <Col>
              <Breadcrumb
                items={[
                  { title: <a onClick={() => navigate('/')}>Home</a> },
                  { title: <a onClick={() => navigate('/news')}>News</a> },
                  { title: news.title },
                ]}
              />
            </Col>
            <Col>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/news')}>
                Back to News
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm rounded-xl border-0 overflow-hidden">
              {/* Cover Image */}
              {news.coverImage && (
                <div className="w-full h-[400px] overflow-hidden mb-6 -mx-6 -mt-6">
                  <img
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meta Data */}
              <div className="mb-6">
                <Space size={[0, 8]} wrap className="mb-4">
                  <Tag
                    color={getCategoryColor(news.category)}
                    className="px-3 py-1 text-sm rounded-full"
                  >
                    {formatCategory(news.category)}
                  </Tag>
                  <Text type="secondary" className="flex items-center gap-1">
                    <CalendarOutlined /> {dayjs(news.publishedAt).format('MMMM D, YYYY')}
                  </Text>
                  <Text type="secondary" className="flex items-center gap-1">
                    <EyeOutlined /> {news.viewCount || 0} views
                  </Text>
                </Space>

                <Title level={1} className="mb-4">
                  {news.title}
                </Title>

                <div className="flex items-center justify-between py-4 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar
                      icon={<UserOutlined />}
                      size="large"
                      className="bg-blue-100 text-blue-600"
                    />
                    <div>
                      <Text strong className="block">
                        {news.author || 'VaxSafe Team'}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Medical Reviewer
                      </Text>
                    </div>
                  </div>
                  <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                    Share
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700">
                <Paragraph className="text-xl font-light text-gray-600 italic border-l-4 border-blue-500 pl-4 mb-8">
                  {news.shortDescription}
                </Paragraph>

                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />
              </div>

              {/* Tags */}
              {news.tags && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Space size={[0, 8]} wrap>
                    <TagOutlined className="text-gray-400" />
                    {news.tags.split(',').map((tag) => (
                      <Tag
                        key={tag}
                        className="bg-gray-100 border-0 text-gray-600 rounded-full px-3"
                      >
                        #{tag.trim()}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Related News */}
            <Card
              title="Related Articles"
              className="shadow-sm rounded-xl border-0 mb-6"
              headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
              <div className="flex flex-col gap-4">
                {relatedNews.length > 0 ? (
                  relatedNews.map((item) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/news/${item.slug}`)}
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={item.thumbnailImage || 'https://placehold.co/100x100?text=News'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1">
                          <Tag
                            color={getCategoryColor(item.category)}
                            className="mb-1 text-[10px] leading-tight"
                          >
                            {formatCategory(item.category)}
                          </Tag>
                          <Title
                            level={5}
                            className="!text-sm !mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors"
                          >
                            {item.title}
                          </Title>
                          <Text type="secondary" className="text-xs">
                            {dayjs(item.publishedAt).format('MMM D, YYYY')}
                          </Text>
                        </div>
                      </div>
                      <Divider className="my-3" />
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No related articles found.</Text>
                )}
              </div>
            </Card>

            {/* Newsletter or Promo */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 rounded-xl shadow-lg text-center">
              <Title level={3} className="!text-white mb-2">
                Stay Healthy
              </Title>
              <Paragraph className="text-white/90 mb-6">
                Book your vaccination appointment today to protect yourself and your family.
              </Paragraph>
              <Button
                size="large"
                className="bg-white text-blue-600 border-0 font-semibold w-full hover:!bg-gray-100"
                onClick={() => navigate('/booking')}
              >
                Book Appointment
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ClientNewsDetailPage;
