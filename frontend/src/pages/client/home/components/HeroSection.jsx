import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useTranslation(['client']);
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <section className="hero-container relative min-h-[800px] flex items-center py-20 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      {/* Grid Overlay for Tech Feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-blue-300 text-sm font-medium mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              {t('client:home.hero.badge')}
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="block text-white">{t('client:home.hero.titlePrefix')}</span>
              <span className="text-gradient-premium">{t('client:home.hero.titleSuffix')}</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
              {t('client:home.hero.description')}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/vaccine">
                <Button
                  type="primary"
                  size="large"
                  className="h-14 px-8 rounded-full text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  {t('client:home.hero.viewVaccines')} <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="large"
                  className="h-14 px-8 rounded-full text-lg font-semibold glass-panel text-white border-white/20 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all"
                >
                  {t('client:home.hero.learnMore')}
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <SafetyOutlined className="text-emerald-400 text-lg" />
                <span>{t('client:home.hero.security')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-blue-400 text-lg" />
                <span>{t('client:home.hero.verifiedRecords')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Card */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Interactive 3D effect */}
          <div
            className="hidden lg:block card-3d-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={cardRef}
              className="card-3d relative w-full max-w-md mx-auto"
              style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
            >
              {/* Main Glass Card */}
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-8 card-3d-content">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {t('client:home.hero.passportCard.title')}
                    </h3>
                    <p className="text-blue-200 text-sm tracking-wider">
                      {t('client:home.hero.passportCard.subtitle')}
                    </p>
                  </div>
                  <QrcodeOutlined className="text-4xl text-white opacity-80" />
                </div>

                {/* Card Body */}
                <div className="space-y-6 card-3d-content">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                      <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                        NV
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide">
                        {t('client:home.hero.passportCard.nameLabel')}
                      </p>
                      <p className="text-white font-medium text-lg">Nguyen Van A</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-slate-400 text-xs mb-1">
                        {t('client:home.hero.passportCard.vaccineType')}
                      </p>
                      <p className="text-emerald-400 font-semibold">COVID-19 mRNA</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-slate-400 text-xs mb-1">
                        {t('client:home.hero.passportCard.doseStatus')}
                      </p>
                      <p className="text-blue-400 font-semibold">
                        {t('client:home.hero.passportCard.fullyVaccinated')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text--[10px] uppercase mb-1">
                        {t('client:home.hero.passportCard.blockchainHash')}
                      </p>
                      <p className="text-slate-300 font-mono text-xs truncate w-32">0x71C...9A23</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded">
                      <CheckCircleOutlined /> {t('client:home.hero.passportCard.verified')}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              </div>

              {/* Floating Badge Behind */}
              <div
                className="absolute -right-10 top-1/2 -translate-y-1/2 glass-panel p-4 rounded-2xl floating-element card-3d-content"
                style={{ animationDelay: '1s' }}
              >
                <SafetyCertificateOutlined className="text-3xl text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
