import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ServiceSection = () => {
  const { t } = useTranslation(['client']);

  const features = [
    {
      icon: (
        <SafetyCertificateOutlined className="text-3xl text-blue-600 group-hover:text-white transition-colors duration-300" />
      ),
      iconBg: 'bg-blue-100 group-hover:bg-blue-600',
      title: t('client:home.service.features.immutableData.title'),
      description: t('client:home.service.features.immutableData.description'),
      delay: '0ms',
    },
    {
      icon: (
        <CheckCircleOutlined className="text-3xl text-emerald-600 group-hover:text-white transition-colors duration-300" />
      ),
      iconBg: 'bg-emerald-100 group-hover:bg-emerald-600',
      title: t('client:home.service.features.instantVerification.title'),
      description: t('client:home.service.features.instantVerification.description'),
      delay: '100ms',
    },
    {
      icon: (
        <GlobalOutlined className="text-3xl text-purple-600 group-hover:text-white transition-colors duration-300" />
      ),
      iconBg: 'bg-purple-100 group-hover:bg-purple-600',
      title: t('client:home.service.features.globalAccess.title'),
      description: t('client:home.service.features.globalAccess.description'),
      delay: '200ms',
    },
  ];

  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      {}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-200/20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
            {t('client:home.service.subtitle')}
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            {t('client:home.service.titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {t('client:home.service.titleSuffix')}
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('client:home.service.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, _index) => (
            <div
              key={f.title}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-100 relative overflow-hidden"
              style={{ animationDelay: f.delay }}
            >
              {}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${f.iconBg}`}
                >
                  {f.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {f.title}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-6">{f.description}</p>

                <div className="flex items-center text-blue-600 font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  {t('client:home.service.learnMore')} <ArrowRightOutlined className="ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
