import { ArrowRightOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchFeaturedNews, callFetchPublishedNews } from '@/services/news.service';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const NewsSection = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Try to get featured news first
        let res = await callFetchFeaturedNews();
        let newsData = res?.data || [];

        // If no featured news, fallback to published news
        if (newsData.length === 0) {
          res = await callFetchPublishedNews();
          newsData = res?.data || [];
        }

        // Take top 3 items
        setNews(newsData.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title level={2} className="mb-4">
            Latest Health News & Updates
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest vaccination guidelines, health tips, and medical
            announcements from our experts.
          </Paragraph>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} md={8} key={i}>
                <Card cover={<Skeleton.Image active className="!w-full !h-48" />}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {news.map((item) => (
              <Col xs={24} md={8} key={item.id}>
                <Card
                  hoverable
                  className="h-full flex flex-col rounded-xl overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  cover={
                    <div className="h-48 overflow-hidden relative group">
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
                    </div>
                  }
                  actions={[
                    <Button
                      type="link"
                      key="read"
                      className="text-blue-600 hover:text-blue-700 p-0 flex items-center justify-center gap-1 w-full"
                      onClick={() => navigate(`/news/${item.slug}`)}
                    >
                      Read Article <ArrowRightOutlined />
                    </Button>,
                  ]}
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
                      <a
                        onClick={() => navigate(`/news/${item.slug}`)}
                        className="text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {item.title}
                      </a>
                    </Title>

                    <Paragraph className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                      {item.shortDescription}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="text-center mt-12">
          <Button
            type="default"
            size="large"
            className="px-8 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/news')}
          >
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
