import { CheckCircleOutlined, GlobalOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ServiceSection = () => {
  const { t } = useTranslation('common');

  const features = [
    {
      icon: <SafetyCertificateOutlined className="text-xl text-blue-600" />,
      iconBg: 'bg-blue-100',
      title: t('service.features.immutableData.title'),
      description: t('service.features.immutableData.description'),
    },
    {
      icon: <CheckCircleOutlined className="text-xl text-green-600" />,
      iconBg: 'bg-green-100',
      title: t('service.features.instantVerification.title'),
      description: t('service.features.instantVerification.description'),
    },
    {
      icon: <GlobalOutlined className="text-xl text-purple-600" />,
      iconBg: 'bg-purple-100',
      title: t('service.features.globalAccess.title'),
      description: t('service.features.globalAccess.description'),
    },
  ];

  return (
    <section className="bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('service.title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('service.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${f.iconBg}`}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
