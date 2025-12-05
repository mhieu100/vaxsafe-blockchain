import { ArrowRightOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchFeaturedNews, callFetchPublishedNews } from '@/services/news.service';

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

        // Take top 4 items for a balanced layout
        setNews(newsData.slice(0, 4));
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
        return 'bg-blue-100 text-blue-700';
      case 'CHILDREN_HEALTH':
        return 'bg-emerald-100 text-emerald-700';
      case 'DISEASE_PREVENTION':
        return 'bg-orange-100 text-orange-700';
      case 'HEALTH_GENERAL':
        return 'bg-purple-100 text-purple-700';
      case 'ANNOUNCEMENT':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCategory = (category) => {
    return category ? category.replace(/_/g, ' ') : 'News';
  };

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
              Latest Updates
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              News &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Insights
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Stay informed with the latest vaccination guidelines, health tips, and medical
              announcements from our experts.
            </p>
          </div>
          <Button
            type="default"
            size="large"
            className="hidden md:flex items-center gap-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all rounded-full px-6"
            onClick={() => navigate('/news')}
          >
            View All Articles <ArrowRightOutlined />
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-3xl p-4 h-[400px] flex flex-col">
                  <Skeleton.Image active className="!w-full !h-48 rounded-2xl mb-4" />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              ))
            : news.map((item, _index) => (
                <div
                  key={item.id}
                  className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate(`/news/${item.slug}`)}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      alt={item.title}
                      src={item.thumbnailImage || 'https://placehold.co/600x400?text=News'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                    {/* Floating Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md bg-white/90 ${getCategoryColor(item.category).replace('bg-', 'text-').replace('text-', 'text-')}`}
                      >
                        {formatCategory(item.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined /> {dayjs(item.publishedAt).format('MMM D, YYYY')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1">
                        <EyeOutlined /> {item.viewCount || 0} views
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-xs line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {item.shortDescription || 'Click to read more about this article...'}
                    </p>

                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Read Article <ArrowRightOutlined className="ml-1.5" />
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Button
            type="primary"
            size="large"
            className="w-full rounded-full h-12 font-semibold"
            onClick={() => navigate('/news')}
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
