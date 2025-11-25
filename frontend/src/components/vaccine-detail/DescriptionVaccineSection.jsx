import { Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const DescriptionVaccineSection = ({ vaccine }) => {
  const { t } = useTranslation('common');

  const items = [
    {
      key: '1',
      label: t('vaccine.descriptionTab'),
      children: (
        <div className="py-6">
          <Title level={3}>{t('vaccine.productDescription')}</Title>
          <Paragraph className="text-base leading-relaxed">
            {vaccine.description || t('vaccine.defaultFullDesc')}
          </Paragraph>
          <Paragraph className="text-base leading-relaxed">
            {t('vaccine.qualityCommitment')}
          </Paragraph>
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
