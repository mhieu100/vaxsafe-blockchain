import { HomeOutlined, LockFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotPermitted = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[80px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-lg w-full px-6 text-center">
        {/* Icon Container */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl shadow-red-500/10 flex items-center justify-center mx-auto transform -rotate-12 hover:rotate-0 transition-transform duration-500">
            <LockFilled className="text-5xl text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-tighter">
          403
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {t('errors.403.title') || 'Access Denied'}
        </h2>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-md mx-auto">
          {t('errors.403.subtitle') ||
            "Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is a mistake."}
        </p>

        {/* Action Button */}
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-none shadow-lg shadow-red-500/30 text-base font-medium"
        >
          {t('errors.403.backHome') || 'Back to Home'}
        </Button>
      </div>
    </div>
  );
};

export default NotPermitted;
