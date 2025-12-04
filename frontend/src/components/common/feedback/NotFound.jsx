import { HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[80px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-lg w-full px-6 text-center">
        {/* Icon Container */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-500/10 flex items-center justify-center mx-auto transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <QuestionCircleOutlined className="text-5xl text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {t('errors.404.title') || 'Page Not Found'}
        </h2>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-md mx-auto">
          {t('errors.404.subtitle') ||
            "Oops! The page you are looking for doesn't exist or has been moved."}
        </p>

        {/* Action Button */}
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg shadow-blue-500/30 text-base font-medium"
        >
          {t('errors.404.backHome') || 'Back to Home'}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
