import { useTranslation } from 'react-i18next';
import {
  CheckCircleOutlined,
  QrcodeOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useTranslation('common');

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">{t('hero.title')}</h1>
            <p className="text-xl text-blue-100 mb-8">{t('hero.subtitle')}</p>
            <div className="space-x-4">
              <Link to="/vaccine">
                <Button type="primary" className="bg-white text-blue-600">
                  {t('hero.viewVaccines')}
                </Button>
              </Link>
              <Link to="/about">
                <Button ghost>{t('hero.learnMore')}</Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative max-w-md w-full ml-auto">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('hero.certificate.title')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('hero.certificate.id')}: VX-••••-••••-••••
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircleOutlined className="text-blue-500 text-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {t('hero.certificate.fullName')}
                    </p>
                    <p className="text-sm font-medium">Nguyen V.</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t('hero.certificate.dob')}
                    </p>
                    <p className="text-sm font-medium">••/••/1990</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t('hero.certificate.vaccine')}
                    </p>
                    <p className="text-sm font-medium">COVID-19</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t('hero.certificate.doses')}
                    </p>
                    <p className="text-sm font-medium">2 / 2</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div className="bg-gray-200 rounded p-2">
                    <QrcodeOutlined className="text-gray-400 text-2xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {t('hero.certificate.blockchainHash')}
                    </p>
                    <p className="text-xs font-mono text-gray-600 truncate">
                      0x1a2b...f8e9
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-32">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mb-1">
                    <SafetyOutlined className="text-blue-500 text-sm" />
                  </div>
                  <p className="text-xs font-medium text-center">
                    {t('hero.certificate.verification')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
