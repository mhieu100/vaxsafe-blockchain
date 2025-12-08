import { ArrowRightOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { callFetchFeaturedNews, callFetchPublishedNews } from '@/services/news.service';

const NewsSection = () => {
  const { t } = useTranslation(['client']);
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);

        let res = await callFetchFeaturedNews();
        let newsData = res?.data || [];

        if (newsData.length === 0) {
          res = await callFetchPublishedNews();
          newsData = res?.data || [];
        }

        setNews(newsData.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
              {t('client:home.news.subtitle')}
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {t('client:home.news.titlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {t('client:home.news.titleSuffix')}
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('client:home.news.description')}
            </p>
          </div>
          <Button
            type="default"
            size="large"
            className="hidden md:flex items-center gap-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all rounded-full px-6"
            onClick={() => navigate('/news')}
          >
            {t('client:home.news.viewAll')} <ArrowRightOutlined />
          </Button>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-3xl p-4 h-[400px] flex flex-col">
                  <Skeleton.Image active className="!w-full !h-48 rounded-2xl mb-4" />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              ))
            : news.map((item, _index) => (
                <button
                  type="button"
                  key={item.id}
                  className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 hover:-translate-y-2 cursor-pointer text-left w-full"
                  onClick={() => navigate(`/news/${item.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/news/${item.slug}`);
                    }
                  }}
                >
                  {}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.thumbnailImage || 'https://placehold.co/600x400?text=News'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {item.category ? item.category.replace(/_/g, ' ') : 'News'}
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-center gap-x-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined /> {dayjs(item.publishedAt).format('MMM D, YYYY')}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeOutlined /> {item.viewCount || 0} {t('client:home.news.views')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-xs line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {item.shortDescription || t('client:home.news.clickToRead')}
                    </p>

                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      {t('client:home.news.readArticle')} <ArrowRightOutlined className="ml-1.5" />
                    </div>
                  </div>
                </button>
              ))}
        </div>

        {}
        <div className="mt-12 text-center md:hidden">
          <Button
            type="primary"
            size="large"
            className="w-full rounded-full h-12 font-semibold"
            onClick={() => navigate('/news')}
          >
            {t('client:home.news.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
