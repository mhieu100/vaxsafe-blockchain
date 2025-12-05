import {
  BlockOutlined,
  GlobalOutlined,
  SafetyCertificateFilled,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Timeline, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    { label: 'Vaccines Tracked', value: '1M+', icon: <SafetyCertificateFilled /> },
    { label: 'Partner Centers', value: '50+', icon: <BlockOutlined /> },
    { label: 'Happy Users', value: '100k+', icon: <TeamOutlined /> },
    { label: 'Uptime', value: '99.9%', icon: <ThunderboltOutlined /> },
  ];

  const features = [
    {
      title: 'Blockchain Security',
      description:
        'Every vaccination record is immutable and secured by advanced blockchain technology, ensuring data integrity and preventing fraud.',
      icon: <BlockOutlined className="text-4xl text-blue-500" />,
    },
    {
      title: 'Global Accessibility',
      description:
        'Access your vaccination history from anywhere in the world. Your digital passport is recognized globally.',
      icon: <GlobalOutlined className="text-4xl text-green-500" />,
    },
    {
      title: 'Instant Verification',
      description:
        'Verifiers can instantly check the authenticity of your records without compromising your privacy.',
      icon: <ThunderboltOutlined className="text-4xl text-yellow-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90 mix-blend-multiply" />
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-400 ring-1 ring-white/10 hover:ring-white/20">
                Revolutionizing Healthcare{' '}
                <a href="#" className="font-semibold text-blue-400">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">
              Trust in Every Dose, <br /> Secured by Blockchain.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              VaxSafe is the world's leading decentralized vaccination management platform. We
              bridge the gap between healthcare providers and patients with immutable, transparent,
              and secure records.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                type="primary"
                size="large"
                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-500/30 text-base font-semibold"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                type="text"
                size="large"
                className="text-white hover:text-blue-300 font-semibold"
                onClick={() => navigate('/contact')}
              >
                Contact Sales <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-12 mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-2 border-l border-slate-100 pl-6 first:border-l-0"
            >
              <dt className="text-sm leading-6 text-slate-500 font-medium">{stat.label}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">{stat.icon}</span>
                {stat.value}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Mission</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            To create a transparent and secure future for global healthcare.
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            We believe that health data belongs to the patient. By leveraging blockchain technology,
            we empower individuals to own, manage, and share their vaccination records securely,
            without intermediaries.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 mb-4">
                  {feature.icon}
                  {feature.title}
                </dt>
                <dd className="flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Timeline/History Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Journey</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Milestones that define us
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Timeline
              mode="alternate"
              items={[
                {
                  children: (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg">2023 - Inception</h3>
                      <p className="text-slate-500">
                        VaxSafe was founded with a vision to secure health records.
                      </p>
                    </div>
                  ),
                  color: 'blue',
                },
                {
                  children: (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg">2024 - Beta Launch</h3>
                      <p className="text-slate-500">
                        Launched pilot program with 10 major vaccination centers.
                      </p>
                    </div>
                  ),
                  color: 'green',
                },
                {
                  children: (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg">2025 - Global Expansion</h3>
                      <p className="text-slate-500">
                        Reached 1 million users and expanded to 5 countries.
                      </p>
                    </div>
                  ),
                  color: 'red',
                },
                {
                  children: (
                    <div>
                      <h3 className="font-bold text-lg">Future</h3>
                      <p className="text-slate-500">
                        Integrating AI for predictive health analytics.
                      </p>
                    </div>
                  ),
                  color: 'gray',
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to secure your health?
              <br />
              Start using VaxSafe today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of users who trust VaxSafe for their vaccination management. Secure,
              fast, and always accessible.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="large"
                className="h-12 px-8 rounded-xl bg-white text-blue-600 hover:bg-blue-50 border-none font-semibold shadow-lg"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
              <Button
                type="text"
                size="large"
                className="text-white hover:text-blue-100 font-semibold"
                onClick={() => navigate('/vaccine')}
              >
                View Vaccines <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
