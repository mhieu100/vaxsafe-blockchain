import {
  CalendarOutlined,
  FileProtectOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const BookingStepsSection = () => {
  const { t } = useTranslation(['client']);

  const steps = [
    {
      id: 1,
      icon: <SearchOutlined className="text-3xl text-blue-600" />,
      title: t('client:home.steps.step1.title'),
      description: t('client:home.steps.step1.desc'),
    },
    {
      id: 2,
      icon: <CalendarOutlined className="text-3xl text-purple-600" />,
      title: t('client:home.steps.step2.title'),
      description: t('client:home.steps.step2.desc'),
    },
    {
      id: 3,
      icon: <UserOutlined className="text-3xl text-emerald-600" />,
      title: t('client:home.steps.step3.title'),
      description: t('client:home.steps.step3.desc'),
    },
    {
      id: 4,
      icon: <FileProtectOutlined className="text-3xl text-orange-600" />,
      title: t('client:home.steps.step4.title'),
      description: t('client:home.steps.step4.desc'),
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
            {t('client:home.steps.subtitle')}
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('client:home.steps.title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('client:home.steps.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-orange-100 -z-10"></div>

          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-100 transition-all duration-300 relative z-10">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed px-4">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookingStepsSection;
