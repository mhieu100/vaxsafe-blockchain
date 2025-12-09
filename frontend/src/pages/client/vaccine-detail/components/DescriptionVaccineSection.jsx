import {
  CheckCircleOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph, Text } = Typography;

const DescriptionVaccineSection = ({ vaccine }) => {
  const { t } = useTranslation('common');

  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      // Check for Postgres array format { "item1", "item2" }
      if (field.trim().startsWith('{') && field.trim().endsWith('}')) {
        try {
          // Replace curly braces with square brackets to make it JSON compatible
          const jsonStr = field.trim().replace(/^{/, '[').replace(/}$/, ']');
          return JSON.parse(jsonStr);
        } catch (e) {
          console.warn('Failed to parse array string:', field, e);
          // Fallback to newline split if parsing fails
        }
      }
      return field.split('\n').filter((item) => item.trim());
    }
    return [];
  };

  const injections = parseArrayField(vaccine.injection);
  const preserves = parseArrayField(vaccine.preserve);
  const contraindications = parseArrayField(vaccine.contraindications);

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <ContainerOutlined />
          {t('vaccine.descriptionTab')}
        </span>
      ),
      children: (
        <div className="py-6">
          <Title level={4} className="mb-4 text-blue-800 border-l-4 border-blue-500 pl-3">
            {t('vaccine.productDescription')}
          </Title>
          <Paragraph className="text-base leading-relaxed text-slate-600 mb-6">
            {vaccine.description}
          </Paragraph>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Text strong className="text-blue-700 block mb-2">
              {t('vaccine.qualityCommitment')}
            </Text>
            <Text className="text-blue-600/80 text-sm">
              100% Authentic • Cold Chain Storage • Verified Sources
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <MedicineBoxOutlined />
          {t('vaccine.injectionTab')}
        </span>
      ),
      children: (
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {injections.length > 0 ? (
              injections.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <CheckCircleOutlined className="text-blue-500 mt-1" />
                  <Text className="flex-1">{item}</Text>
                </div>
              ))
            ) : (
              <Text type="secondary">{t('vaccine.noDataAvailable')}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2">
          <ExperimentOutlined />
          {t('vaccine.preserveTab')}
        </span>
      ),
      children: (
        <div className="py-6">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <Title level={5} className="text-amber-800 mb-4 flex items-center gap-2">
              <span className="text-xl">❄️</span> {t('vaccine.storageRequirements')}
            </Title>
            {preserves.length > 0 ? (
              <ul className="space-y-3">
                {preserves.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-amber-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">{t('vaccine.noDataAvailable')}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-2">
          <WarningOutlined />
          {t('vaccine.contraindicationsTab')}
        </span>
      ),
      children: (
        <div className="py-6">
          {contraindications.length > 0 ? (
            <div className="space-y-3">
              {contraindications.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl border border-red-100 bg-red-50/50"
                >
                  <div className="bg-red-100 text-red-500 p-2 rounded-full h-fit">
                    <WarningOutlined />
                  </div>
                  <div>
                    <Text strong className="text-red-700 block mb-1">
                      {t('vaccine.contraindication')} {index + 1}
                    </Text>
                    <Text className="text-slate-600">{item}</Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text type="secondary">{t('vaccine.noDataAvailable')}</Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mt-12">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default DescriptionVaccineSection;
